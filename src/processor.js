import { analyzeChange } from './engine.js';
import { formatCheckOutput } from './format.js';
import {
  createCheckRun,
  fetchCodeowners,
  fetchPullFiles,
  getInstallationToken
} from './github.js';
import { normalizeMarketplacePurchase } from './marketplace.js';

const PR_ACTIONS = new Set(['opened', 'reopened', 'synchronize', 'ready_for_review']);

export async function handlePullRequest(payload, config) {
  if (!PR_ACTIONS.has(payload.action)) {
    return { ignored: true, reason: `pull_request action ${payload.action} is not analyzed` };
  }

  const installationId = payload.installation?.id;
  const repository = payload.repository;
  const pull = payload.pull_request;

  if (!installationId || !repository || !pull) {
    throw new Error('pull_request webhook is missing installation, repository, or pull_request data');
  }

  const owner = repository.owner.login;
  const repo = repository.name;
  const token = await getInstallationToken(config, installationId);
  const pullFiles = await fetchPullFiles(token, owner, repo, pull.number);
  const codeowners = await fetchCodeowners(token, owner, repo, pull.base.sha);
  const analysis = analyzeChange({
    files: pullFiles.files,
    codeownersText: codeowners?.content || null,
    truncated: pullFiles.truncated
  });

  const check = formatCheckOutput(analysis);
  const result = await createCheckRun(token, owner, repo, pull.head.sha, check);

  return {
    ignored: false,
    repository: repository.full_name,
    pullNumber: pull.number,
    headSha: pull.head.sha,
    checkRunId: result.id,
    impact: analysis.impact,
    complete: analysis.complete,
    findings: analysis.findings.length
  };
}

export async function dispatchWebhook(eventName, payload, { config, store }) {
  if (eventName === 'pull_request') {
    return handlePullRequest(payload, config);
  }

  if (eventName === 'marketplace_purchase') {
    const event = normalizeMarketplacePurchase(payload);
    await store.recordMarketplaceEvent(event);
    return { marketplace: true, event };
  }

  if (eventName === 'ping') {
    return { pong: true, zen: payload.zen || null };
  }

  if (eventName === 'installation' || eventName === 'installation_repositories') {
    return { lifecycle: true, eventName, action: payload.action || null };
  }

  return { ignored: true, reason: `event ${eventName} is not handled` };
}
