# SET v1.0.0 RC1 — final consolidation audit

This build consolidates the requested web product features through v0.9.10 into one release candidate.

## Included and locally verified

- Hard subscription paywall, Stripe checkout/portal/webhook hardening, 7-day trial and monthly/yearly plans.
- Finance workflows: summary, devis, invoices, deposits, PDF invoices, collections and approval-gated formal notice.
- Helvetica Neue system font stack.
- Unified Messages UI with contact avatars and outbound adapters for WhatsApp Business, Telegram and Email.
- Moodboard and Casting media libraries, device import, cloud-link import entry points, selection/shortlist and PDF export.
- Calendar & Booking Hub UI with Google, Microsoft, Apple/iCloud, Yahoo and Setmore connection surfaces, ICS export and calendar link schema.
- Contacts: manual entry, avatar, phone/vCard import, CSV/JSON database import and duplicate filtering.
- Project card overflow menu: rename, share, copy stable project link and guarded delete.
- Existing authentication, Supabase schema/RLS and App Store/mobile scaffold retained.

## Configuration-gated integrations

The following cannot be truthfully considered live until their external credentials/accounts are configured and end-to-end tested in the deployed environment:

- WhatsApp Business Cloud API
- Telegram Bot API
- Resend/domain email sending
- Google Calendar OAuth and token sync
- Microsoft Graph Calendar OAuth and token sync
- Setmore API access
- Google Drive Picker OAuth
- Dropbox Chooser/OAuth
- Apple/iCloud and Yahoo two-way calendar sync beyond ICS-compatible export/subscription flows

## Known architecture boundary before GA

Projects, tasks, events, contacts, messages and media workspace state are still partly browser/localStorage-driven in the current client. The Supabase production schema already contains projects, tasks, events, contacts, moodboards, messages and expenses, but the UI is not yet fully migrated to cloud CRUD. Therefore cross-device data consistency and stable shared project URLs are not GA-complete until that migration is finished.

This release is correctly labeled **RC1**, not a finished App Store/GA build.

## Verification performed

- Node test suite.
- Static feature-coverage checks for all requested UI capabilities.
- Environment-template coverage for server secrets.
- Basic live-secret pattern scan of release-facing text/client files.
- JSON/package validation.

A full Next.js production build requires dependency installation. Dependency installation did not complete in the current isolated build environment, so Vercel/GitHub CI remains the authoritative production-build check.
