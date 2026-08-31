import Stripe from 'stripe';

let client;
export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not configured');
  client ||= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export function priceIdForPlan(code) {
  const ids = {
    pro_monthly: process.env.STRIPE_PRICE_MONTHLY,
    pro_yearly: process.env.STRIPE_PRICE_YEARLY,
  };
  const id = ids[code];
  if (!id) throw new Error(`Stripe price is not configured for ${code}`);
  return id;
}
