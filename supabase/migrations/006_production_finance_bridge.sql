-- SET v0.8 production finance bridge for the existing SET Supabase schema.
-- Designed to coexist with the earlier projects/estimates/invoices tables.

alter table public.invoices alter column project_id drop not null;
alter table public.invoices add column if not exists invoice_number text;
alter table public.invoices add column if not exists invoice_type text not null default 'standard';
alter table public.invoices add column if not exists issue_date date not null default current_date;
alter table public.invoices add column if not exists client_name text;
alter table public.invoices add column if not exists client_email text;
alter table public.invoices add column if not exists client_address text;
alter table public.invoices add column if not exists client_type text not null default 'business';
alter table public.invoices add column if not exists vat numeric(12,2) not null default 0;
alter table public.invoices add column if not exists balance_due numeric(12,2) not null default 0;
alter table public.invoices add column if not exists deposit_percent numeric(5,2);
alter table public.invoices add column if not exists notes text;
alter table public.invoices add column if not exists sent_at timestamptz;
alter table public.invoices add column if not exists viewed_at timestamptz;
alter table public.invoices add column if not exists paid_at timestamptz;
alter table public.invoices add column if not exists late_penalty_rate numeric(7,4);
alter table public.invoices add column if not exists recovery_fee numeric(12,2) not null default 40;
alter table public.invoices add column if not exists legal_mentions jsonb not null default '{}'::jsonb;
alter table public.invoices add column if not exists provider_invoice_id text;
alter table public.invoices add column if not exists payment_url text;
alter table public.invoices add column if not exists payment_reference text;
alter table public.invoices add column if not exists finalized_at timestamptz;
update public.invoices set invoice_number=coalesce(invoice_number,number), vat=coalesce(vat,tax,0), balance_due=greatest(total-coalesce(amount_paid,0),0) where invoice_number is null or balance_due=0;
create unique index if not exists invoices_owner_invoice_number_unique on public.invoices(owner_id,invoice_number) where invoice_number is not null;

create table if not exists public.business_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 business_name text, legal_name text, address text, email text, phone text, siret text, vat_number text,
 vat_status text not null default 'franchise', iban text, bic text,
 invoice_prefix text not null default 'SET', next_invoice_number integer not null default 1,
 default_payment_days integer not null default 30, default_deposit_percent numeric(5,2) not null default 50,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 project_id uuid references public.projects(id) on delete set null, quote_number text not null,
 status text not null default 'draft', client_name text, client_email text, client_address text,
 currency text not null default 'EUR', issue_date date not null default current_date, valid_until date,
 subtotal numeric(12,2) not null default 0, vat numeric(12,2) not null default 0, total numeric(12,2) not null default 0,
 deposit_percent numeric(5,2) not null default 50, notes text, accepted_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id,quote_number)
);
create table if not exists public.quote_items (
 id uuid primary key default gen_random_uuid(), quote_id uuid not null references public.quotes(id) on delete cascade,
 description text not null, quantity numeric(12,3) not null default 1 check(quantity>0), unit_price numeric(12,2) not null default 0,
 vat_rate numeric(7,4) not null default 0, sort_order integer not null default 0, created_at timestamptz not null default now()
);
create table if not exists public.invoice_items (
 id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices(id) on delete cascade,
 description text not null, quantity numeric(12,3) not null default 1 check(quantity>0), unit_price numeric(12,2) not null default 0,
 vat_rate numeric(7,4) not null default 0, sort_order integer not null default 0, created_at timestamptz not null default now()
);

create table if not exists public.billing_plans (
 id uuid primary key default gen_random_uuid(), code text unique not null, name text not null, interval text not null,
 amount_cents integer not null, currency text not null default 'EUR', trial_days integer not null default 7,
 active boolean not null default true, apple_product_id text, stripe_price_id text, sort_order integer not null default 0,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
insert into public.billing_plans(code,name,interval,amount_cents,trial_days,sort_order) values
('pro_monthly','SET Monthly','month',999,7,1),('pro_yearly','SET Yearly','year',9999,7,2) on conflict(code) do nothing;

create table if not exists public.subscriptions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 plan_id uuid references public.billing_plans(id), plan_code text, provider text not null,
 provider_customer_id text, provider_subscription_id text, provider_original_transaction_id text,
 status text not null default 'trialing', trial_ends_at timestamptz, current_period_ends_at timestamptz,
 cancel_at_period_end boolean not null default false, last_verified_at timestamptz,
 metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists subscriptions_provider_external_unique on public.subscriptions(provider,provider_subscription_id) where provider_subscription_id is not null;
create table if not exists public.subscription_entitlements (
 user_id uuid primary key references auth.users(id) on delete cascade, source text not null,
 product_code text, active boolean not null default false, expires_at timestamptz, last_verified_at timestamptz,
 raw jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
create table if not exists public.tax_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade, country text not null default 'FR', regime text,
 activity_type text, social_rate numeric(7,4), cfp_rate numeric(7,4), income_tax_reserve_rate numeric(7,4) default 0,
 updated_at timestamptz not null default now()
);
create table if not exists public.finance_rule_sets (
 id uuid primary key default gen_random_uuid(), country text not null default 'FR', code text not null,
 effective_from date not null, effective_to date, rules jsonb not null default '{}'::jsonb,
 source_url text, source_label text, verified_at timestamptz, created_at timestamptz not null default now(), unique(country,code,effective_from)
);
insert into public.finance_rule_sets(country,code,effective_from,rules,source_label) values
('FR','micro_bic_service','2026-01-01','{"social_rate":21.2,"recovery_fee_b2b":40,"formal_notice_requires_approval":true}'::jsonb,'Release-time verification required'),
('FR','micro_bnc_service','2026-01-01','{"social_rate":25.6,"recovery_fee_b2b":40,"formal_notice_requires_approval":true}'::jsonb,'Release-time verification required') on conflict do nothing;

create table if not exists public.payment_events (
 id uuid primary key default gen_random_uuid(), invoice_id uuid references public.invoices(id) on delete set null,
 owner_id uuid not null references auth.users(id) on delete cascade, provider text not null, provider_event_id text,
 event_type text not null, amount numeric(12,2), currency text not null default 'EUR', payload jsonb not null default '{}'::jsonb,
 occurred_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create unique index if not exists payment_events_provider_event_unique on public.payment_events(provider,provider_event_id) where provider_event_id is not null;
create table if not exists public.collection_actions (
 id uuid primary key default gen_random_uuid(), invoice_id uuid not null references public.invoices(id) on delete cascade,
 action_type text not null, status text not null default 'pending', scheduled_for timestamptz,
 requires_approval boolean not null default false, approved_by uuid references auth.users(id) on delete set null,
 approved_at timestamptz, sent_at timestamptz, subject text, body text, metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 constraint formal_notice_requires_approval check(action_type not in ('formal_notice_draft','formal_notice_sent') or requires_approval=true)
);
create table if not exists public.audit_log (
 id bigserial primary key, actor_id uuid references auth.users(id) on delete set null, entity_type text not null,
 entity_id text not null, action text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create or replace function public.next_invoice_number(uid uuid default auth.uid()) returns text language plpgsql security definer set search_path=public as $$
declare n integer; prefix text; result text;
begin
 insert into public.business_profiles(user_id) values(uid) on conflict(user_id) do nothing;
 select next_invoice_number,coalesce(nullif(invoice_prefix,''),'SET') into n,prefix from public.business_profiles where user_id=uid for update;
 result:=prefix||'-'||extract(year from current_date)::int||'-'||lpad(n::text,4,'0');
 update public.business_profiles set next_invoice_number=n+1,updated_at=now() where user_id=uid;
 return result;
end $$;

create or replace function public.refresh_invoice_balance(target uuid) returns void language plpgsql security definer set search_path=public as $$
declare paid numeric(12,2);
begin
 select coalesce(sum(amount),0) into paid from public.payment_events where invoice_id=target and event_type in ('payment_succeeded','manual_payment','bank_payment');
 update public.invoices set amount_paid=paid,balance_due=greatest(total-paid,0),status=case when paid>=total and total>0 then 'paid' when paid>0 then 'partially_paid' else status end,paid_at=case when paid>=total and total>0 then coalesce(paid_at,now()) else paid_at end,updated_at=now() where id=target;
end $$;

create or replace function public.queue_invoice_collection_actions(target_invoice uuid) returns integer language plpgsql security definer set search_path=public as $$
declare inv public.invoices; inserted_count integer:=0;
begin
 select * into inv from public.invoices where id=target_invoice and owner_id=auth.uid();
 if not found then raise exception 'Invoice not found or access denied'; end if;
 if inv.status='paid' or inv.due_date is null then return 0; end if;
 insert into public.collection_actions(invoice_id,action_type,scheduled_for,requires_approval,subject,body) values
 (inv.id,'friendly_reminder',inv.due_date::timestamptz-interval '7 days',false,'Upcoming invoice due date','A friendly reminder that this invoice is due soon.'),
 (inv.id,'due_reminder',inv.due_date::timestamptz,false,'Invoice due today','This invoice is due today.'),
 (inv.id,'overdue_reminder',inv.due_date::timestamptz+interval '1 day',false,'Invoice overdue','This invoice is now overdue.'),
 (inv.id,'overdue_reminder',inv.due_date::timestamptz+interval '7 days',false,'Payment reminder','This invoice remains overdue.'),
 (inv.id,'formal_notice_draft',inv.due_date::timestamptz+interval '14 days',true,'Mise en demeure — review required','Draft only. Owner approval is required before sending.');
 get diagnostics inserted_count=row_count; return inserted_count;
end $$;

alter table public.business_profiles enable row level security; alter table public.quotes enable row level security;
alter table public.quote_items enable row level security; alter table public.invoice_items enable row level security;
alter table public.billing_plans enable row level security; alter table public.subscriptions enable row level security;
alter table public.subscription_entitlements enable row level security; alter table public.tax_profiles enable row level security;
alter table public.finance_rule_sets enable row level security; alter table public.payment_events enable row level security;
alter table public.collection_actions enable row level security; alter table public.audit_log enable row level security;

drop policy if exists "own business profile" on public.business_profiles; create policy "own business profile" on public.business_profiles for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "own quotes" on public.quotes; create policy "own quotes" on public.quotes for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "quote items owner access" on public.quote_items; create policy "quote items owner access" on public.quote_items for all to authenticated using(exists(select 1 from public.quotes q where q.id=quote_id and q.owner_id=auth.uid())) with check(exists(select 1 from public.quotes q where q.id=quote_id and q.owner_id=auth.uid()));
drop policy if exists "invoice items owner access" on public.invoice_items; create policy "invoice items owner access" on public.invoice_items for all to authenticated using(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid())) with check(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid()));
drop policy if exists "billing plans read" on public.billing_plans; create policy "billing plans read" on public.billing_plans for select to authenticated using(active=true);
drop policy if exists "own subscriptions" on public.subscriptions; create policy "own subscriptions" on public.subscriptions for select to authenticated using(user_id=auth.uid());
drop policy if exists "own entitlement" on public.subscription_entitlements; create policy "own entitlement" on public.subscription_entitlements for select to authenticated using(user_id=auth.uid());
drop policy if exists "own tax profile" on public.tax_profiles; create policy "own tax profile" on public.tax_profiles for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "finance rules read" on public.finance_rule_sets; create policy "finance rules read" on public.finance_rule_sets for select to authenticated using(true);
drop policy if exists "payment events owner read" on public.payment_events; create policy "payment events owner read" on public.payment_events for select to authenticated using(owner_id=auth.uid());
drop policy if exists "collection owner access" on public.collection_actions; create policy "collection owner access" on public.collection_actions for all to authenticated using(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid())) with check(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid()));
drop policy if exists "audit own read" on public.audit_log; create policy "audit own read" on public.audit_log for select to authenticated using(actor_id=auth.uid());

create index if not exists invoices_owner_due_v08_idx on public.invoices(owner_id,status,due_date);
create index if not exists quotes_owner_status_v08_idx on public.quotes(owner_id,status,issue_date desc);
create index if not exists collection_actions_schedule_v08_idx on public.collection_actions(status,scheduled_for);
