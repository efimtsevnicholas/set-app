-- SET RC6: cloud/realtime collaboration foundation, aligned with production schema.

alter table public.projects add column if not exists client text;
alter table public.projects add column if not exists spent numeric not null default 0;
alter table public.projects add column if not exists progress integer not null default 0 check (progress between 0 and 100);
alter table public.projects add column if not exists ui_payload jsonb not null default '{}'::jsonb;

alter table public.tasks add column if not exists description text default '';
alter table public.tasks add column if not exists deliverable_type text default 'General';
alter table public.tasks add column if not exists progress integer not null default 0 check (progress between 0 and 100);
alter table public.tasks add column if not exists priority text not null default 'Medium';
alter table public.tasks add column if not exists ui_payload jsonb not null default '{}'::jsonb;

alter table public.project_events add column if not exists ui_payload jsonb not null default '{}'::jsonb;

alter table public.project_files add column if not exists folder text not null default 'Client Files';
alter table public.project_files add column if not exists storage_path text;
alter table public.project_files add column if not exists mime_type text;
alter table public.project_files add column if not exists size_bytes bigint not null default 0;
alter table public.project_files add column if not exists uploaded_by uuid references auth.users(id) on delete set null;

create or replace function public.set_can_access_project(pid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.projects p where p.id=pid and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=pid and m.user_id=auth.uid());
$$;

-- Project owners manage projects; confirmed members can read the project they participate in.
drop policy if exists "projects owner access" on public.projects;
drop policy if exists "projects read access" on public.projects;
drop policy if exists "projects owner insert" on public.projects;
drop policy if exists "projects owner update" on public.projects;
drop policy if exists "projects owner delete" on public.projects;
create policy "projects read access" on public.projects for select to authenticated using(public.set_can_access_project(id));
create policy "projects owner insert" on public.projects for insert to authenticated with check(owner_id=auth.uid());
create policy "projects owner update" on public.projects for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "projects owner delete" on public.projects for delete to authenticated using(owner_id=auth.uid());

-- Team members collaborate on project operational data.
drop policy if exists "tasks owner access" on public.tasks;
drop policy if exists "tasks project access" on public.tasks;
create policy "tasks project access" on public.tasks for all to authenticated using(public.set_can_access_project(project_id)) with check(public.set_can_access_project(project_id));

drop policy if exists "events owner access" on public.project_events;
drop policy if exists "events project access" on public.project_events;
create policy "events project access" on public.project_events for all to authenticated using(public.set_can_access_project(project_id)) with check(public.set_can_access_project(project_id));

drop policy if exists "files owner access" on public.project_files;
drop policy if exists "files project access" on public.project_files;
create policy "files project access" on public.project_files for all to authenticated using(public.set_can_access_project(project_id)) with check(public.set_can_access_project(project_id));

drop policy if exists "project members owner access" on public.project_members;
drop policy if exists "project members read" on public.project_members;
drop policy if exists "project members owner manage" on public.project_members;
create policy "project members read" on public.project_members for select to authenticated using(public.set_can_access_project(project_id));
create policy "project members owner manage" on public.project_members for all to authenticated
using(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()))
with check(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()));

create table if not exists public.workspace_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  kind text not null,
  record_key text not null default 'collection',
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (project_id is not null or owner_id is not null)
);
create unique index if not exists workspace_records_user_unique on public.workspace_records(owner_id,kind,record_key) where project_id is null;
create unique index if not exists workspace_records_project_unique on public.workspace_records(project_id,kind,record_key) where project_id is not null;
alter table public.workspace_records enable row level security;
drop policy if exists "workspace records access" on public.workspace_records;
create policy "workspace records access" on public.workspace_records for all to authenticated
using ((project_id is null and owner_id=auth.uid()) or (project_id is not null and public.set_can_access_project(project_id)))
with check ((project_id is null and owner_id=auth.uid()) or (project_id is not null and public.set_can_access_project(project_id)));

create table if not exists public.project_invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  email text not null,
  name text,
  role text,
  status text not null default 'invited' check (status in ('invited','accepted','declined','revoked')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id,email)
);
alter table public.project_invites enable row level security;
drop policy if exists "project invites access" on public.project_invites;
create policy "project invites access" on public.project_invites for select to authenticated
using (
  exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or lower(email)=lower(coalesce(auth.jwt()->>'email',''))
);
create policy "project invites owner insert" on public.project_invites for insert to authenticated
with check(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()));
create policy "project invites owner update" on public.project_invites for update to authenticated
using(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()));
create policy "project invites owner delete" on public.project_invites for delete to authenticated
using(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()));

create or replace function public.accept_project_invite(invite_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare inv public.project_invites;
begin
  select * into inv from public.project_invites where id=invite_id;
  if inv.id is null or lower(inv.email)<>lower(coalesce(auth.jwt()->>'email','')) then
    raise exception 'invite_not_allowed';
  end if;
  insert into public.project_members(project_id,user_id,name,role,email)
  values(inv.project_id,auth.uid(),coalesce(inv.name,split_part(inv.email,'@',1)),inv.role,inv.email);
  update public.project_invites set status='accepted',updated_at=now() where id=invite_id;
end $$;

insert into storage.buckets(id,name,public,file_size_limit)
values('set-project-files','set-project-files',false,52428800)
on conflict(id) do update set file_size_limit=excluded.file_size_limit;

create or replace function public.is_project_storage_member(object_name text)
returns boolean language plpgsql stable security definer set search_path=public as $$
declare pid uuid;
begin
  begin pid := split_part(object_name,'/',1)::uuid; exception when others then return false; end;
  return public.set_can_access_project(pid);
end $$;

drop policy if exists "set project files read" on storage.objects;
drop policy if exists "set project files insert" on storage.objects;
drop policy if exists "set project files update" on storage.objects;
drop policy if exists "set project files delete" on storage.objects;
create policy "set project files read" on storage.objects for select to authenticated using(bucket_id='set-project-files' and public.is_project_storage_member(name));
create policy "set project files insert" on storage.objects for insert to authenticated with check(bucket_id='set-project-files' and public.is_project_storage_member(name));
create policy "set project files update" on storage.objects for update to authenticated using(bucket_id='set-project-files' and public.is_project_storage_member(name));
create policy "set project files delete" on storage.objects for delete to authenticated using(bucket_id='set-project-files' and public.is_project_storage_member(name));

do $$ begin
  begin alter publication supabase_realtime add table public.projects; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.tasks; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.project_events; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.workspace_records; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.project_files; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.project_invites; exception when duplicate_object then null; end;
end $$;
