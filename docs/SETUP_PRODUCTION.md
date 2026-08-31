# SET v0.3 — Production Setup

## Stack
- Next.js web application
- Supabase: Postgres, Auth, Storage, Realtime
- Vercel: web deployment
- Expo / React Native: native iOS build path

## Backend
1. Create a Supabase project in an EU region.
2. Add the values from `.env.example` to `.env.local`.
3. Run `supabase/migrations/001_set_schema.sql` in the Supabase SQL editor or through the Supabase CLI.
4. Create Storage buckets: `avatars`, `project-files`, `moodboards`, `receipts`.
5. Enable Realtime for `messages`, `tasks`, `events`, and `project_members` as needed.
6. Configure Auth redirect URL for `/auth/callback`.

## Security baseline
- Row Level Security is enabled for every application table.
- Project access is limited to the owner and confirmed members.
- Storage policies must mirror project membership before uploads are enabled.
- Never expose service-role keys to the browser.

## Before public launch
- Replace demo/localStorage flows with Supabase queries.
- Add invitation email flow.
- Add file upload and signed URLs.
- Add rate limiting and abuse controls for public endpoints.
- Add error monitoring and production backups.
- Run accessibility, security and mobile QA.
- Complete App Store metadata, privacy declarations and review build.

## Existing SET Supabase project (important)
The connected production SET database predates the local greenfield finance migrations. Do **not** replay migrations 001–005 blindly on that database. The production-compatible bridge has already been applied as:
- `set_v08_production_finance_bridge`
- `set_v08_finance_rpc_hardening`
- `verify_france_2026_finance_rules`

For a brand-new empty Supabase project, review the migration chain before applying it. For the existing SET project, use the live migration history as source of truth.

## Collections cron
`vercel.json` schedules `/api/collections/process` daily at 08:00 UTC. Configure `CRON_SECRET`; formal notices remain excluded from automatic delivery and must be approved/sent manually.

## Release blockers that require account credentials
Stripe checkout/webhooks need Stripe secret/webhook/Price IDs. Transactional emails need a verified sender and Resend key. Apple entitlement verification needs App Store Connect issuer/key/bundle credentials. These values are intentionally not committed to source.
