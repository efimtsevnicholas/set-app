# SET v0.9.1 Pre-deploy audit

Audited before Vercel redeploy on 2026-08-31.

## Fixed
- Next.js upgraded from vulnerable 15.2.4 to 15.5.24 (Maintenance LTS security release).
- Removed obsolete `next lint` script usage for Next.js 15.5.
- Kept server secrets out of client modules; `.env*` remains ignored except `.env.example`.

## Verified locally
- 7/7 Node tests pass.
- All non-JSX server/API JavaScript parses with Node syntax checks.
- Next 15 async request APIs already use `await cookies()` / `await headers()` where used.
- Vercel cron route exists and requires `CRON_SECRET`.
- Supabase service-role key is referenced only in server-side code.

## Deployment prerequisites
Required for core authenticated production runtime:
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY

Feature credentials can be added later:
- Stripe keys and Price IDs
- Resend key / verified sender
- CRON_SECRET
- Apple App Store Server API credentials

## Environment limitation
A complete `npm install` / `next build` could not be executed in the packaging environment because npm registry dependency installation timed out. Vercel is therefore the authoritative clean-install production build check.
