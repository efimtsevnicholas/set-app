create table if not exists public.calendar_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google','microsoft','apple','yahoo','setmore')),
  external_account_id text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  sync_enabled boolean not null default true,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,provider,external_account_id)
);
create table if not exists public.calendar_event_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  set_event_id text not null,
  external_event_id text not null,
  external_calendar_id text,
  sync_hash text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,provider,external_event_id)
);
alter table public.calendar_connections enable row level security;
alter table public.calendar_event_links enable row level security;
create policy "calendar_connections_owner" on public.calendar_connections for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "calendar_event_links_owner" on public.calendar_event_links for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
