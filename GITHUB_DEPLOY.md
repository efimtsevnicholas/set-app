# SET — GitHub → Vercel deployment

This folder is ready to be committed as the root of a GitHub repository.

## 1. Create a GitHub repository
Create a private repository named `set-app` (recommended) and upload the CONTENTS of this folder to the repository root.

Important: `package.json`, `app/`, `lib/`, `public/`, `vercel.json`, etc. must be directly at the repository root, not inside another nested folder.

## 2. Connect Vercel
In Vercel → project `set-app` → Connect Git Repository → choose the new GitHub repository.
Framework preset should detect Next.js automatically.

## 3. Environment variables
Add the production variables listed in `.env.example` / `docs/SETUP_PRODUCTION.md` in Vercel Project Settings → Environment Variables.
Never commit real secrets to GitHub.

## 4. Deploy
After the repository is connected, Vercel will build and deploy on each push to the production branch.
