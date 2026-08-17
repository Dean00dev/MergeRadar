import crypto from 'node:crypto';

export function signWebhook(secret, body) {
  return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
}

export function verifyWebhookSignature(secret, body, signature) {
  if (!secret || !signature || !signature.startsWith('sha256=')) return false;

  const expected = Buffer.from(signWebhook(secret, body));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length) return false;

  return crypto.timingSafeEqual(expected, supplied);
}

export class DeliveryCache {
  constructor({ ttlMs = 10 * 60_000, max = 10_000 } = {}) {
    this.ttlMs = ttlMs;
    this.max = max;
    this.entries = new Map();
  }

  seen(id, now = Date.now()) {
    this.sweep(now);
    if (this.entries.has(id)) return true;
    this.entries.set(id, now + this.ttlMs);

    if (this.entries.size > this.max) {
      const oldest = this.entries.keys().next().value;
      this.entries.delete(oldest);
    }

    return false;
  }

  sweep(now = Date.now()) {
    for (const [id, expires] of this.entries) {
      if (expires <= now) this.entries.delete(id);
    }
  }
}
