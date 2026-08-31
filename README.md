# SET v0.8

Creative production workspace — white / black / red UI, finance automation and subscription infrastructure.

## v0.8 additions

- Stripe Checkout for €9.99 monthly / €99.99 yearly with 7-day trial.
- Stripe webhook → subscription entitlement synchronization.
- Supabase server/admin helpers and authenticated API routes.
- Real PDF invoice generation and email attachment delivery.
- Transactional email adapter for invoices and payment reminders.
- Automatic non-legal collections queue processor.
- Formal notices are database-enforced as approval-required.
- Manual payment reconciliation with audit trail.
- Tests for pricing, trials, tax reserve and overdue calculations.

# SET v0.4 — Cross-platform Production Foundation

SET is a creative production operating system for photographers, creative directors, producers and teams.

## Included
- Next.js web application foundation
- Supabase-ready PostgreSQL/Auth/RLS schema
- Expo/React Native iOS + Android application scaffold
- EAS build profiles for development, preview and production
- CI workflow
- Launch, privacy and legal documentation

## Web
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Mobile
```bash
cd mobile
npm install
cp .env.example .env
npx expo start
```

## Production activation
External credentials are intentionally not stored in this repository. Once a Supabase project is authorized, add its public URL and publishable key to the web and mobile environment files, then run the migration in `supabase/migrations/001_set_schema.sql`.


## v0.8 commercial workflow
Finance now supports API-first devis and invoice creation, quote-to-deposit conversion, sequential invoice numbering, balance tracking, Stripe Billing Portal, collection approval gates, business-profile settings, and unified Apple/Stripe entitlement storage. See `docs/V0.8_EXECUTION_STATUS.md`.
