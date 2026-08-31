-- SET v0.3 production schema
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  handle text unique,
  avatar_url text,
  roles text[] not null default '{}',
  location text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  client text,
  location text,
  shoot_date date,
  status text not null default 'pre-production',
  budget numeric(12,2) not null default 0,
  spent numeric(12,2) not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text,
  member_status text not null default 'invited',
  created_at timestamptz not null default now(),
  primary key(project_id,user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  due_at timestamptz,
  status text not null default 'todo',
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.moodboards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.moodboard_items (
  id uuid primary key default gen_random_uuid(),
  moodboard_id uuid not null references public.moodboards(id) on delete cascade,
  storage_path text,
  source_url text,
  caption text,
  position integer not null default 0,
  approved boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (storage_path is not null or source_url is not null)
);

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  unique(project_id,name)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  category text,
  description text not null,
  amount numeric(12,2) not null check(amount >= 0),
  currency text not null default 'EUR',
  receipt_path text,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  name text not null,
  company text,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create or replace function public.is_project_member(pid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.projects p where p.id=pid and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=pid and m.user_id=auth.uid() and m.member_status='confirmed');
$$;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.moodboards enable row level security;
alter table public.moodboard_items enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.expenses enable row level security;
alter table public.contacts enable row level security;

create policy "profile read" on public.profiles for select to authenticated using(true);
create policy "profile self insert" on public.profiles for insert to authenticated with check(auth.uid()=id);
create policy "profile self update" on public.profiles for update to authenticated using(auth.uid()=id);

create policy "project member read" on public.projects for select to authenticated using(public.is_project_member(id));
create policy "project owner insert" on public.projects for insert to authenticated with check(owner_id=auth.uid());
create policy "project owner update" on public.projects for update to authenticated using(owner_id=auth.uid());
create policy "project owner delete" on public.projects for delete to authenticated using(owner_id=auth.uid());

create policy "member read" on public.project_members for select to authenticated using(public.is_project_member(project_id));
create policy "owner manage members" on public.project_members for all to authenticated using(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())) with check(exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid()));

create policy "tasks project access" on public.tasks for all to authenticated using(public.is_project_member(project_id)) with check(public.is_project_member(project_id));
create policy "events project access" on public.events for all to authenticated using(public.is_project_member(project_id)) with check(public.is_project_member(project_id));
create policy "moodboards project access" on public.moodboards for all to authenticated using(public.is_project_member(project_id)) with check(public.is_project_member(project_id));
create policy "moodboard items project access" on public.moodboard_items for all to authenticated using(exists(select 1 from public.moodboards b where b.id=moodboard_id and public.is_project_member(b.project_id))) with check(exists(select 1 from public.moodboards b where b.id=moodboard_id and public.is_project_member(b.project_id)));
create policy "channels project access" on public.channels for all to authenticated using(public.is_project_member(project_id)) with check(public.is_project_member(project_id));
create policy "messages channel access" on public.messages for all to authenticated using(exists(select 1 from public.channels c where c.id=channel_id and public.is_project_member(c.project_id))) with check(exists(select 1 from public.channels c where c.id=channel_id and public.is_project_member(c.project_id)));
create policy "expenses project access" on public.expenses for all to authenticated using(public.is_project_member(project_id)) with check(public.is_project_member(project_id));
create policy "contacts owner access" on public.contacts for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1))); return new; end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
