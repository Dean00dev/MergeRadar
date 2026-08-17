import crypto from 'node:crypto';

const API = 'https://api.github.com';
const API_VERSION = '2026-03-10';

function b64url(value) {
  return Buffer.from(value).toString('base64url');
}

export function createAppJwt({ appId, privateKey, now = Date.now() }) {
  const iat = Math.floor(now / 1000) - 60;
  const exp = iat + 9 * 60;
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({ iat, exp, iss: String(appId) }));
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), privateKey).toString('base64url');
  return `${unsigned}.${signature}`;
}

async function apiRequest(pathname, { token, method = 'GET', body, accept } = {}) {
  const headers = {
    Accept: accept || 'application/vnd.github+json',
    'X-GitHub-Api-Version': API_VERSION,
    'User-Agent': 'MergeRadar/0.1.0'
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`GitHub API ${method} ${pathname} failed: ${response.status} ${text.slice(0, 500)}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function getInstallationToken(config, installationId) {
  const jwt = createAppJwt(config);
  const result = await apiRequest(`/app/installations/${installationId}/access_tokens`, {
    token: jwt,
    method: 'POST'
  });
  return result.token;
}

export async function fetchPullFiles(token, owner, repo, pullNumber) {
  const files = [];
  for (let page = 1; page <= 30; page += 1) {
    const batch = await apiRequest(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/files?per_page=100&page=${page}`,
      { token }
    );
    files.push(...batch);
    if (batch.length < 100) break;
  }

  return files.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    changes: file.changes,
    previousFilename: file.previous_filename || null
  }));
}

async function fetchTextContent(token, owner, repo, pathname, ref) {
  try {
    const result = await apiRequest(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${pathname.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(ref)}`,
      { token }
    );

    if (result.type !== 'file' || result.encoding !== 'base64' || typeof result.content !== 'string') {
      return null;
    }
    return Buffer.from(result.content.replace(/\s/gu, ''), 'base64').toString('utf8');
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function fetchCodeowners(token, owner, repo, ref) {
  const candidates = ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS'];
  for (const pathname of candidates) {
    const content = await fetchTextContent(token, owner, repo, pathname, ref);
    if (content !== null) return { path: pathname, content };
  }
  return null;
}

export async function createCheckRun(token, owner, repo, headSha, report) {
  return apiRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/check-runs`, {
    token,
    method: 'POST',
    body: {
      ...report,
      head_sha: headSha,
      external_id: `mergeradar:${owner}/${repo}:${headSha}`
    }
  });
}
