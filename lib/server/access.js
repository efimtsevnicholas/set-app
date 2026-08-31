import { requireUser } from './auth.js';
import { createSupabaseAdmin } from './supabase-admin.js';
import { hasProAccess } from '../billing.js';

export async function getAccessState() {
  const user = await requireUser();
  const db = createSupabaseAdmin();
  const { data, error } = await db.from('subscriptions')
    .select('provider_customer_id,status,plan_code,current_period_ends_at,trial_ends_at')
    .eq('user_id', user.id)
    .eq('provider', 'stripe')
    .maybeSingle();
  if (error) throw error;
  return { user, subscription: data || null, hasAccess: hasProAccess(data) };
}

export async function requireProUser() {
  const state = await getAccessState();
  if (!state.hasAccess) {
    const error = new Error('SUBSCRIPTION_REQUIRED');
    error.user = state.user;
    throw error;
  }
  return state.user;
}
