# SET v0.9.9 — Contacts Import

Adds a full Contacts workspace with manual contact creation, optional contact photos, phone/vCard import, and database import from CSV/JSON/vCard exports. Contacts are persisted locally in the current web build using SET local storage, consistent with the existing project workspace data model.

On browsers that expose the Contact Picker API, **Import from phone** can request selected address-book contacts directly. On iPhone/web browsers where direct contact access is not exposed, SET automatically falls back to vCard import. The future native iOS build can use the native Contacts permission for direct address-book import.

# SET v0.9.8 — Calendar & Booking Hub

Adds a unified Calendar UI with Month / Week / Day / Agenda modes, richer events, project linking, calendar integration cards, ICS export for Apple/iCloud/Yahoo-compatible calendars, and OAuth entry-point routes for Google Calendar and Microsoft 365 plus Setmore API readiness.

## Production credentials still required
Google and Microsoft OAuth client IDs/secrets and Setmore API access must be configured before live two-way sync can operate. The database migration adds connection and external-event link tables so duplicate external events can be prevented once callbacks/token storage are enabled.


## v0.9.10 — Project actions
Project cards now include a three-dot menu with Rename, Share, Copy project link, and Delete project. Share uses the native Web Share API when available and falls back to copying the stable project-ID URL. Delete requires confirmation.
