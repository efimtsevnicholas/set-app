const required=['NEXT_PUBLIC_APP_URL','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY'];
const optional=['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','STRIPE_PRICE_MONTHLY','STRIPE_PRICE_YEARLY','RESEND_API_KEY','SET_EMAIL_FROM','CRON_SECRET','APPLE_ISSUER_ID','APPLE_KEY_ID','APPLE_BUNDLE_ID','APPLE_PRIVATE_KEY'];
const missing=required.filter(k=>!process.env[k]);
console.log(JSON.stringify({ready:missing.length===0,missing_required:missing,optional_not_configured:optional.filter(k=>!process.env[k])},null,2));
if(missing.length) process.exitCode=1;
