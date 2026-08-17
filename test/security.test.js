import test from 'node:test';
import assert from 'node:assert/strict';
import { DeliveryCache, signWebhook, verifyWebhookSignature } from '../src/security.js';

test('webhook signature verification accepts correct HMAC and rejects tampering', () => {
  const secret = 'top-secret';
  const body = Buffer.from('{"hello":"world"}');
  const signature = signWebhook(secret, body);

  assert.equal(verifyWebhookSignature(secret, body, signature), true);
  assert.equal(verifyWebhookSignature(secret, Buffer.from('{"hello":"mars"}'), signature), false);
  assert.equal(verifyWebhookSignature(secret, body, 'sha256=deadbeef'), false);
});

test('delivery cache rejects duplicate delivery IDs inside TTL', () => {
  const cache = new DeliveryCache({ ttlMs: 1000, max: 5 });
  assert.equal(cache.seen('abc', 0), false);
  assert.equal(cache.seen('abc', 500), true);
  cache.sweep(1001);
  assert.equal(cache.seen('abc', 1001), false);
});
