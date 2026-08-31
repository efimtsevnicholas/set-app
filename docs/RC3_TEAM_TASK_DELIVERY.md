# SET v1.0 RC3 — Team task delivery

Implemented in the web client:
- tasks remain explicitly linked to projects and can be filtered/moved by project;
- task deliverable types (Moodboard, Casting, Call Sheet, Shot List, Retouching, Final Images, Video, Budget, Invoice, Other);
- multi-person assignees from Contacts;
- shared progress surface (0–100%), activity history, comments and checklist;
- task deliverable files up to 5 MB each can be attached in the client;
- reaching 100% triggers `/api/tasks/notify-completion`;
- the notification endpoint emails assigned Contacts with email addresses and attaches eligible deliverable files;
- local browser Notification is shown when browser permission was previously granted;
- migration `010_collaborative_tasks_notifications.sql` defines the cloud schema needed for true multi-user tasks, activity, deliverables and push subscriptions.

Production limitation: current SET Projects/Tasks/Contacts still use the existing localStorage path in the client. Therefore cross-device/team realtime visibility is not yet live until these entities are moved to Supabase and project membership/RLS are connected. The migration is a schema foundation, not proof that production migration has been applied. Native iOS push (APNs) / Web Push subscription delivery also requires push credentials and subscription registration.
