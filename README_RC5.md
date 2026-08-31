# SET v1.0 RC5 — Production Workflow
Adds reusable client billing profiles, editable/movable/deletable typed calendar events, Network editing/project invitations, Workspace Team invitation states, editable project Schedule, project budget reserve calculation, and active per-project file upload/folder UI.

## Persistence boundary
The RC5 UI persists these newly added workflow surfaces in the browser where the existing app still uses localStorage. Existing Supabase-backed finance APIs remain server-backed. True cross-device/project-file binary synchronization requires the planned Supabase CRUD + Storage migration and is not falsely marked complete in this RC.
