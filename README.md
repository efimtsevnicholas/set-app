# SET v2.2 — Clean Release
Clean Next.js 15 rebuild with no middleware and no blocking server auth calls.

## Vercel
1. Replace repository contents with these files.
2. Add Environment Variables from `.env.example` (use your real Supabase publishable key).
3. Deploy.

This release intentionally has no `middleware.js`; it cannot reproduce the previous middleware timeout.
