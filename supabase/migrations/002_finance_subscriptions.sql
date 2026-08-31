-- SET v0.5 finance + subscriptions foundation
create table if not exists public.billing_plans (
 id uuid primary key default gen_random_uuid(), code text unique not null,
 name text not null, interval text not null check(interval in ('month','year')),
 amount_cents integer not null check(amount_cents>=0), currency text not null default 'EUR',
 trial_days integer not null default 7, active boolean not null default true,
 apple_product_id text, stripe_price_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into public.billing_plans(code,name,interval,amount_cents,trial_days) values
 ('pro_monthly','SET Monthly','month',999,7),('pro_yearly','SET Yearly','year',9999,7)
on conflict(code) do nothing;

create table if not exists public.subscriptions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 plan_id uuid references public.billing_plans(id), provider text not null check(provider in ('apple','stripe','manual')),
 provider_subscription_id text, status text not null default 'trialing', trial_ends_at timestamptz,
 current_period_ends_at timestamptz, cancel_at_period_end boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.invoices (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
 project_id uuid references public.projects(id) on delete set null, contact_id uuid references public.contacts(id) on delete set null,
 invoice_number text not null, invoice_type text not null default 'final', status text not null default 'draft',
 issue_date date not null default current_date, due_date date, currency text not null default 'EUR',
 subtotal numeric(12,2) not null default 0, vat numeric(12,2) not null default 0, total numeric(12,2) not null default 0,
 deposit_percent numeric(5,2), payment_url text, notes text, created_at timestamptz not null default now(), unique(owner_id,invoice_number)
);
create table if not exists public.invoice_reminders (
 id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices(id) on delete cascade,
 stage text not null, scheduled_for timestamptz, sent_at timestamptz, requires_approval boolean not null default false,
 approved_at timestamptz, body text, created_at timestamptz not null default now()
);
create table if not exists public.tax_profiles (
 user_id uuid primary key references public.profiles(id) on delete cascade, country text not null default 'FR',
 regime text, activity_type text, social_rate numeric(7,4), cfp_rate numeric(7,4), income_tax_reserve_rate numeric(7,4) default 0,
 updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security; alter table public.invoices enable row level security;
alter table public.invoice_reminders enable row level security; alter table public.tax_profiles enable row level security;
create policy "own subscriptions" on public.subscriptions for select to authenticated using(user_id=auth.uid());
create policy "own invoices" on public.invoices for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "own invoice reminders" on public.invoice_reminders for all to authenticated using(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid())) with check(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid()));
create policy "own tax profile" on public.tax_profiles for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
