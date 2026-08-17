export function normalizeMarketplacePurchase(payload, receivedAt = new Date().toISOString()) {
  const purchase = payload.marketplace_purchase || {};
  const account = purchase.account || {};
  const plan = purchase.plan || {};

  return {
    action: payload.action || 'unknown',
    accountId: account.id || null,
    accountLogin: account.login || null,
    accountType: account.type || null,
    planId: plan.id || null,
    planName: plan.name || null,
    billingCycle: purchase.billing_cycle || null,
    unitCount: purchase.unit_count ?? null,
    freeTrialEndsOn: purchase.free_trial_ends_on || null,
    effectiveDate: purchase.effective_date || null,
    receivedAt
  };
}
