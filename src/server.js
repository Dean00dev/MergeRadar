import http from 'node:http';
import { loadConfig, assertGitHubConfig } from './config.js';
import { DeliveryCache, verifyWebhookSignature } from './security.js';
import { dispatchWebhook } from './processor.js';
import { JsonStore } from './store.js';

const config = loadConfig();
const store = new JsonStore(config.dataFile);
const deliveries = new DeliveryCache();

function log(level, message, fields = {}) {
  process.stdout.write(`${JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    ...fields
  })}\n`);
}

function send(res, status, body, contentType = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

async function readBody(req, limit = 2 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('request body too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function homepage() {
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MergeRadar</title>
<style>body{font:16px system-ui;max-width:760px;margin:12vh auto;padding:0 24px;line-height:1.55}code{background:#f3f4f6;padding:.15em .35em;border-radius:5px}.pill{display:inline-block;padding:.25em .6em;border:1px solid #aaa;border-radius:999px}</style>
<h1>MergeRadar</h1>
<p><strong>Know what a pull request can affect before you merge it.</strong></p>
<p class="pill">deterministic change-impact mapping</p>
<p>MergeRadar maps changed paths to explainable review surfaces and reports the result as a GitHub Check. It does not claim to prove a change safe.</p>
<p><a href="https://github.com/Dean00dev/MergeRadar">Source and documentation</a></p>
</html>`;
}

async function handleWebhook(req, res) {
  try {
    assertGitHubConfig(config);
    const rawBody = await readBody(req);
    const signature = req.headers['x-hub-signature-256'];

    if (!verifyWebhookSignature(config.webhookSecret, rawBody, signature)) {
      send(res, 401, { error: 'invalid webhook signature' });
      return;
    }

    const delivery = req.headers['x-github-delivery'];
    if (!delivery) {
      send(res, 400, { error: 'missing X-GitHub-Delivery' });
      return;
    }

    if (deliveries.seen(delivery)) {
      send(res, 202, { accepted: true, duplicate: true });
      return;
    }

    const eventName = req.headers['x-github-event'];
    if (!eventName) {
      send(res, 400, { error: 'missing X-GitHub-Event' });
      return;
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      send(res, 400, { error: 'invalid JSON' });
      return;
    }

    send(res, 202, { accepted: true, delivery, event: eventName });

    dispatchWebhook(eventName, payload, { config, store })
      .then((result) => log('info', 'webhook processed', { delivery, event: eventName, result }))
      .catch((error) => log('error', 'webhook processing failed', {
        delivery,
        event: eventName,
        error: error.message,
        stack: error.stack
      }));
  } catch (error) {
    const status = error.message === 'request body too large' ? 413 : 500;
    send(res, status, { error: error.message });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/') {
    send(res, 200, homepage(), 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && url.pathname === '/healthz') {
    send(res, 200, {
      ok: true,
      service: 'MergeRadar',
      version: '0.1.0',
      githubConfigured: Boolean(config.appId && config.privateKey && config.webhookSecret)
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/installed') {
    send(res, 200, '<!doctype html><meta charset="utf-8"><title>MergeRadar installed</title><h1>MergeRadar installed</h1><p>Open a pull request in an installed repository to generate its change-impact check.</p>', 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'POST' && url.pathname === '/webhook') {
    await handleWebhook(req, res);
    return;
  }

  send(res, 404, { error: 'not found' });
});

server.listen(config.port, () => {
  log('info', 'MergeRadar listening', { port: config.port });
});
