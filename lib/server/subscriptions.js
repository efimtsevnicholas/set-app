import { hasProAccess } from '../billing.js';

const ACTIVE_STATUSES = ['trialing','active','past_due'];

export async function getStripeSubscriptions(db, userId) {
  const { data, error } = await db.from('subscriptions')
    .select('id,provider_customer_id,provider_subscription_id,status,plan_code,current_period_ends_at,trial_ends_at,created_at,updated_at')
    .eq('user_id', userId)
    .eq('provider', 'stripe')
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export function pickCurrentSubscription(rows = []) {
  return rows.find((row) => hasProAccess(row)) ||
    rows.find((row) => ACTIVE_STATUSES.includes(row.status)) ||
    rows[0] || null;
}

export async function getCurrentStripeSubscription(db, userId) {
  const rows = await getStripeSubscriptions(db, userId);
  return { subscription: pickCurrentSubscription(rows), rows };
}
