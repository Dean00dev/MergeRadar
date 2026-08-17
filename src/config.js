export function loadConfig(env = process.env) {
  const privateKey = (env.GITHUB_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  return {
    port: Number(env.PORT || 3000),
    appId: env.GITHUB_APP_ID || '',
    privateKey,
    webhookSecret: env.GITHUB_WEBHOOK_SECRET || '',
    appUrl: (env.APP_URL || '').replace(/\/+$/u, ''),
    dataFile: env.DATA_FILE || './data/mergeradar.json',
    logLevel: env.LOG_LEVEL || 'info'
  };
}

export function assertGitHubConfig(config) {
  const missing = [];
  if (!config.appId) missing.push('GITHUB_APP_ID');
  if (!config.privateKey) missing.push('GITHUB_PRIVATE_KEY');
  if (!config.webhookSecret) missing.push('GITHUB_WEBHOOK_SECRET');
  if (missing.length) {
    throw new Error(`Missing required GitHub App configuration: ${missing.join(', ')}`);
  }
}
