import { requireUser } from './auth.js';
import { createSupabaseAdmin } from './supabase-admin.js';
import { hasProAccess } from '../billing.js';
import { getCurrentStripeSubscription } from './subscriptions.js';

export async function getAccessState() {
  const user = await requireUser();
  const db = createSupabaseAdmin();
  const { subscription } = await getCurrentStripeSubscription(db, user.id);
  return { user, subscription, hasAccess: hasProAccess(subscription) };
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
