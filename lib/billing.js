export const DEFAULT_PLANS = Object.freeze([
  { code: 'pro_monthly', name: 'SET Monthly', interval: 'month', amountCents: 999, currency: 'EUR', trialDays: 7 },
  { code: 'pro_yearly', name: 'SET Yearly', interval: 'year', amountCents: 9999, currency: 'EUR', trialDays: 7 },
]);

export function hasProAccess(subscription, now = new Date()) {
  if (!subscription) return false;
  if (['active', 'trialing'].includes(subscription.status)) {
    if (!subscription.current_period_ends_at && !subscription.trial_ends_at) return true;
    const end = subscription.status === 'trialing' ? subscription.trial_ends_at : subscription.current_period_ends_at;
    return !end || new Date(end) > now;
  }
  return false;
}

export function yearlySavingPercent(monthlyCents, yearlyCents) {
  const monthly = Number(monthlyCents) || 0;
  const yearly = Number(yearlyCents) || 0;
  if (!monthly) return 0;
  return Math.max(0, Math.round((1 - yearly / (monthly * 12)) * 100));
}
