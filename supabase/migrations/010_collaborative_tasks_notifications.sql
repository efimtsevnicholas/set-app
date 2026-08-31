-- SET RC3: collaborative tasks, progress visibility, deliverables and notification subscriptions
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid,
  title text not null,
  description text default '',
  deliverable_type text default 'General',
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null default 'open' check (status in ('open','in_progress','completed','cancelled')),
  priority text not null default 'Medium',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.task_assignees (
  task_id uuid not null references public.project_tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  contact_email text,
  contact_name text,
  assigned_at timestamptz not null default now(),
  primary key (task_id, contact_email)
);
create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.project_tasks(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null, author_name text, body text not null, created_at timestamptz not null default now()
);
create table if not exists public.task_activity (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.project_tasks(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null, event_type text not null, payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.task_deliverables (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.project_tasks(id) on delete cascade,
  name text not null, storage_path text, mime_type text, size_bytes bigint, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now()
);
create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('email','web_push','ios_push')), endpoint text, push_token text, enabled boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.project_tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_activity enable row level security;
alter table public.task_deliverables enable row level security;
alter table public.notification_subscriptions enable row level security;
-- Owner-safe baseline. Team-member RLS should be expanded when project membership is fully cloud-backed.
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='project_tasks' and policyname='project_tasks_owner') then
    create policy project_tasks_owner on public.project_tasks for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='notification_subscriptions' and policyname='notification_subscriptions_owner') then
    create policy notification_subscriptions_owner on public.notification_subscriptions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
  end if;
end $$;
