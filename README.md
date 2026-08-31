# SET v1.0.0 RC3.2

Hotfix release for the Tasks build syntax failure plus the RC3.1 Supabase auth cookie fix.

Verification in this environment:
- `npm test`: regression suite
- `node scripts-final-check.mjs`: static release checks

A full local `next build` was attempted, but dependency installation timed out in the execution environment before `node_modules` was created. Vercel/GitHub CI should therefore remain the authoritative production build gate.
