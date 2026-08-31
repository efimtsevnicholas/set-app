# SET v1.0 RC6 — Cloud Realtime

RC6 moves SET from browser-only state toward a real collaborative workspace.

Implemented in this build:
- Supabase-backed Projects, Tasks and Calendar events with Realtime subscriptions.
- First-login migration of existing local Projects/Tasks/Events into cloud UUID records when the account has no cloud projects.
- Cloud-synced Clients, Contacts, Network and per-project Team collections, with local cache fallback.
- Private Supabase Storage bucket for project files, signed URL opening and delete support.
- Team-aware RLS for project operational data.
- Project invitation schema plus `accept_project_invite()` RPC foundation.
- Existing Finance, Call Sheet, Moodboards, Tasks collaboration, billing and auth fixes retained.

Production database migration `set_rc6_cloud_realtime_workspace_v2` was applied successfully to Supabase.

Known remaining integration work:
- automatic invitation email/auth acceptance UI;
- provider-backed push notifications;
- full Google/Microsoft calendar two-way CRUD callbacks;
- inbound WhatsApp/Telegram/email sync;
- moving remaining media blobs from browser data URLs to Storage.
