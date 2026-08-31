# SET v0.6 — Cross-platform Creative Production OS

SET is a creative production operating system for photographers, creative directors, producers and teams.

## Included
- White / black / red editorial design system
- Finance, invoices, deposits, tax-reserve tools and auditable collections workflow
- Monthly/yearly subscription foundation with 7-day trial and cross-platform entitlement model
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
External credentials are intentionally not stored in this repository. Once a Supabase project is authorized, add its public URL and publishable key to the web and mobile environment files, then run all migrations in `supabase/migrations/` in numeric order.
