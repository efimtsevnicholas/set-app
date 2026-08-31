-- SET v0.8 — quotes, business profile, numbering and commercial workflow
create table if not exists public.business_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  business_name text,
  legal_name text,
  address text,
  email text,
  phone text,
  siret text,
  vat_number text,
  vat_status text not null default 'franchise' check(vat_status in ('franchise','liable','exempt','unknown')),
  iban text,
  bic text,
  invoice_prefix text not null default 'SET',
  next_invoice_number integer not null default 1,
  default_payment_days integer not null default 30,
  default_deposit_percent numeric(5,2) not null default 50,
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  quote_number text not null,
  status text not null default 'draft' check(status in ('draft','sent','accepted','rejected','expired','converted')),
  client_name text,
  client_email text,
  client_address text,
  currency text not null default 'EUR',
  issue_date date not null default current_date,
  valid_until date,
  subtotal numeric(12,2) not null default 0,
  vat numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  deposit_percent numeric(5,2) not null default 50,
  notes text,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, quote_number)
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity numeric(12,3) not null default 1 check(quantity > 0),
  unit_price numeric(12,2) not null default 0 check(unit_price >= 0),
  vat_rate numeric(7,4) not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.invoices
  add column if not exists quote_id uuid references public.quotes(id) on delete set null,
  add column if not exists parent_invoice_id uuid references public.invoices(id) on delete set null,
  add column if not exists amount_paid numeric(12,2) not null default 0,
  add column if not exists balance_due numeric(12,2) not null default 0,
  add column if not exists payment_reference text,
  add column if not exists finalized_at timestamptz;

create table if not exists public.subscription_entitlements (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  source text not null check(source in ('stripe','apple','manual')),
  product_code text,
  active boolean not null default false,
  expires_at timestamptz,
  last_verified_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.next_invoice_number(uid uuid default auth.uid())
returns text language plpgsql security definer set search_path=public as $$
declare p public.business_profiles; n integer; result text;
begin
  select * into p from public.business_profiles where user_id=uid for update;
  if not found then
    insert into public.business_profiles(user_id) values(uid) returning * into p;
  end if;
  n := p.next_invoice_number;
  result := coalesce(nullif(p.invoice_prefix,''),'SET') || '-' || extract(year from current_date)::int || '-' || lpad(n::text,4,'0');
  update public.business_profiles set next_invoice_number=n+1, updated_at=now() where user_id=uid;
  return result;
end; $$;

create or replace function public.refresh_invoice_balance(target uuid)
returns void language plpgsql security definer set search_path=public as $$
declare paid numeric(12,2);
begin
  select coalesce(sum(amount),0) into paid from public.payment_events where invoice_id=target and event_type in ('payment_succeeded','manual_payment','bank_payment');
  update public.invoices set amount_paid=paid, balance_due=greatest(total-paid,0), status=case when paid>=total and total>0 then 'paid' when paid>0 then 'partially_paid' else status end, paid_at=case when paid>=total and total>0 then coalesce(paid_at,now()) else paid_at end, updated_at=now() where id=target;
end; $$;

alter table public.business_profiles enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.subscription_entitlements enable row level security;

create policy "own business profile" on public.business_profiles for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "own quotes" on public.quotes for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "quote items owner access" on public.quote_items for all to authenticated using(exists(select 1 from public.quotes q where q.id=quote_id and q.owner_id=auth.uid())) with check(exists(select 1 from public.quotes q where q.id=quote_id and q.owner_id=auth.uid()));
create policy "own entitlement" on public.subscription_entitlements for select to authenticated using(user_id=auth.uid());

create index if not exists quotes_owner_status_idx on public.quotes(owner_id,status,issue_date desc);
create index if not exists invoices_quote_idx on public.invoices(quote_id);
