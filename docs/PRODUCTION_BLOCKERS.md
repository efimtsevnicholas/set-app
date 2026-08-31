# SET production blockers

## Already connected
- Supabase project `SET` is active and healthy.
- Production finance bridge and RPC hardening migrations are applied.
- Public Supabase URL and publishable key are available from the connected project.

## External secrets still required
These must be configured in the hosting provider and must never be committed to source control:
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MONTHLY`
- `STRIPE_PRICE_YEARLY`
- `RESEND_API_KEY`
- `SET_EMAIL_FROM`
- `CRON_SECRET`
- Apple App Store Server API credentials for verified iOS entitlements

## Deployment status
The connected Vercel deployment action currently rejects its own exposed empty schema while internally requiring `target`, `name`, and `files`. This is a connector limitation, not a SET source-code error.

## Build status
Core node tests pass. A full Next.js build still requires installed dependencies; package installation timed out in the current execution environment.
