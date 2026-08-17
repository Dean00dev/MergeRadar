import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMarketplacePurchase } from '../src/marketplace.js';

test('marketplace purchase payload is normalized without inventing entitlement semantics', () => {
  const event = normalizeMarketplacePurchase({
    action: 'purchased',
    marketplace_purchase: {
      account: { id: 42, login: 'acme', type: 'Organization' },
      plan: { id: 7, name: 'free' },
      billing_cycle: 'monthly',
      unit_count: 3
    }
  }, '2026-08-17T00:00:00.000Z');

  assert.deepEqual(event, {
    action: 'purchased',
    accountId: 42,
    accountLogin: 'acme',
    accountType: 'Organization',
    planId: 7,
    planName: 'free',
    billingCycle: 'monthly',
    unitCount: 3,
    freeTrialEndsOn: null,
    effectiveDate: null,
    receivedAt: '2026-08-17T00:00:00.000Z'
  });
});
