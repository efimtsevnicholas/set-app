import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('access code no longer assumes one subscription row',()=>{
  const access=fs.readFileSync(new URL('../lib/server/access.js',import.meta.url),'utf8');
  assert.equal(access.includes('.maybeSingle()'),false);
  assert.equal(access.includes('getCurrentStripeSubscription'),true);
});

test('checkout blocks an already active subscription',()=>{
  const checkout=fs.readFileSync(new URL('../app/api/billing/checkout/route.js',import.meta.url),'utf8');
  assert.equal(checkout.includes('ALREADY_SUBSCRIBED'),true);
  assert.equal(checkout.includes('idempotencyKey'),true);
});

test('webhook trims secret and handles created subscription events',()=>{
  const webhook=fs.readFileSync(new URL('../app/api/billing/webhook/route.js',import.meta.url),'utf8');
  assert.equal(webhook.includes(".trim()"),true);
  assert.equal(webhook.includes('customer.subscription.created'),true);
});
