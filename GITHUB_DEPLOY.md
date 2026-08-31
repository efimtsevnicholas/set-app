# SET 1.0 FINAL — deployment

Upload the contents of this folder to the repository root (not the outer folder itself), commit to the Vercel production branch, then watch the Vercel build until it is green.

Required core production variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

Billing variables:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_MONTHLY
- STRIPE_PRICE_YEARLY

Email delivery:
- RESEND_API_KEY
- SET_EMAIL_FROM

Optional external integrations require their own credentials. Do not put secret keys in browser-prefixed `NEXT_PUBLIC_*` variables unless that provider explicitly requires a public client/app key.

After deployment verify: login, subscription gate, create/delete project, project deep link, tablet navigation, task realtime update, calendar create/edit/delete, invite member + accept invitation, file upload/open/delete, moodboard sync, invoice PDF/send and Call Sheet.
