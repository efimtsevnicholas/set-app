# SET v1.0 RC6 — Cloud Realtime Foundation

Projects, tasks and calendar events now have Supabase cloud synchronization plus Realtime subscriptions. Clients, Contacts, Network, Team and project file metadata use synchronized workspace records with local fallback. Project Files upload to a private Supabase Storage bucket and open through signed URLs.

Apply `supabase/migrations/011_cloud_realtime_workspace.sql` before deployment. On first authenticated launch, if no cloud projects exist, SET imports the browser's existing projects/tasks/events and remaps project references to cloud UUIDs.

The migration also adds project invitation records and `accept_project_invite()`. Invitation email delivery is still provider-dependent and must be wired to the production email/auth flow before calling invitations fully automatic.
