# SET Production Architecture

Frontend: Next.js / React for web dashboard.
Mobile: React Native / Expo sharing product logic where practical.
Backend: PostgreSQL with row-level security.
Auth: email + OAuth, with session management.
Storage: private object storage with signed URLs.
Realtime: WebSocket/realtime channels for project chat and updates.
Notifications: APNs/FCM.
Payments: subscription billing.
Observability: error tracking, audit logging, uptime monitoring.

## Core entities
users, profiles, organizations, memberships, projects, project_members, boards, moodboard_items, tasks, events, channels, messages, contacts, casting_calls, casting_candidates, expenses, files, approvals, notifications.

## Permission model
Owner > Admin > Producer > Editor > Commenter > Viewer, scoped to organization and project.
