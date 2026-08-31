# SET 1.0 GA

Consolidated GA source package.

Local release validation is complete. Production deployment is a separate gate: run the full Next.js build in CI/Vercel, verify environment variables, then smoke-test authentication, subscription, project CRUD, calendar CRUD, client/contact/network sync, invoice edit/PDF/email, and Supabase access before promoting the deployment.

Provider-dependent OAuth/App Store integrations remain configuration/integration work and are not represented as live until verified.
