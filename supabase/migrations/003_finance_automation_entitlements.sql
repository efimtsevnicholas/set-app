-- SET v0.6 — finance automation, entitlement layer and auditable collections

alter table public.billing_plans
  add column if not exists sort_order integer not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.subscriptions
  add column if not exists provider_customer_id text,
  add column if not exists provider_original_transaction_id text,
  add column if not exists last_verified_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists subscriptions_provider_external_unique
  on public.subscriptions(provider, provider_subscription_id)
  where provider_subscription_id is not null;

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric(12,3) not null default 1 check(quantity > 0),
  unit_price numeric(12,2) not null default 0 check(unit_price >= 0),
  vat_rate numeric(7,4) not null default 0 check(vat_rate >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.invoices
  add column if not exists client_type text not null default 'business' check(client_type in ('business','consumer','public')),
  add column if not exists paid_at timestamptz,
  add column if not exists sent_at timestamptz,
  add column if not exists viewed_at timestamptz,
  add column if not exists late_penalty_rate numeric(7,4),
  add column if not exists recovery_fee numeric(12,2) not null default 40,
  add column if not exists legal_mentions jsonb not null default '{}'::jsonb,
  add column if not exists provider_invoice_id text,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices(id) on delete set null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check(provider in ('stripe','apple','bank','cash','manual')),
  provider_event_id text,
  event_type text not null,
  amount numeric(12,2),
  currency text not null default 'EUR',
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create unique index if not exists payment_events_provider_event_unique
  on public.payment_events(provider, provider_event_id)
  where provider_event_id is not null;

create table if not exists public.finance_rule_sets (
  id uuid primary key default gen_random_uuid(),
  country text not null default 'FR',
  code text not null,
  effective_from date not null,
  effective_to date,
  rules jsonb not null default '{}'::jsonb,
  source_url text,
  source_label text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(country, code, effective_from)
);

insert into public.finance_rule_sets(country,code,effective_from,rules,source_label) values
('FR','micro_bic_service','2026-01-01','{"social_rate":21.2,"recovery_fee_b2b":40,"formal_notice_requires_approval":true}'::jsonb,'URSSAF / French Ministry — verify before production use'),
('FR','micro_bnc_service','2026-01-01','{"social_rate":25.6,"recovery_fee_b2b":40,"formal_notice_requires_approval":true}'::jsonb,'URSSAF / French Ministry — verify before production use')
on conflict do nothing;

create table if not exists public.collection_actions (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  action_type text not null check(action_type in ('friendly_reminder','due_reminder','overdue_reminder','formal_notice_draft','formal_notice_sent','manual_note')),
  status text not null default 'pending' check(status in ('pending','approved','sent','cancelled','failed')),
  scheduled_for timestamptz,
  requires_approval boolean not null default false,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  sent_at timestamptz,
  subject text,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.has_set_pro_access(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.subscriptions s
    where s.user_id=uid
      and s.status in ('active','trialing')
      and (
        (s.status='trialing' and (s.trial_ends_at is null or s.trial_ends_at > now()))
        or
        (s.status='active' and (s.current_period_ends_at is null or s.current_period_ends_at > now()))
      )
  );
$$;

create or replace function public.queue_invoice_collection_actions(target_invoice uuid)
returns integer language plpgsql security definer set search_path=public as $$
declare
  inv public.invoices;
  inserted integer := 0;
begin
  select * into inv from public.invoices where id=target_invoice and owner_id=auth.uid();
  if not found then raise exception 'Invoice not found or access denied'; end if;
  if inv.status='paid' or inv.paid_at is not null or inv.due_date is null then return 0; end if;

  insert into public.collection_actions(invoice_id,action_type,scheduled_for,requires_approval,subject,body)
  values
    (inv.id,'friendly_reminder',(inv.due_date::timestamptz - interval '7 days'),false,'Upcoming invoice due date','A friendly reminder that this invoice is due soon.'),
    (inv.id,'due_reminder',inv.due_date::timestamptz,false,'Invoice due today','This invoice is due today.'),
    (inv.id,'overdue_reminder',(inv.due_date::timestamptz + interval '1 day'),false,'Invoice overdue','This invoice is now overdue.'),
    (inv.id,'overdue_reminder',(inv.due_date::timestamptz + interval '7 days'),false,'Payment reminder','This invoice remains overdue.'),
    (inv.id,'formal_notice_draft',(inv.due_date::timestamptz + interval '14 days'),true,'Mise en demeure — review required','Draft only. Owner approval is required before sending.')
  on conflict do nothing;
  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

alter table public.invoice_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.finance_rule_sets enable row level security;
alter table public.collection_actions enable row level security;
alter table public.audit_log enable row level security;

create policy "invoice items owner access" on public.invoice_items for all to authenticated
using(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid()))
with check(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid()));

create policy "payment events owner read" on public.payment_events for select to authenticated using(owner_id=auth.uid());
create policy "public finance rules read" on public.finance_rule_sets for select to authenticated using(true);
create policy "collection owner access" on public.collection_actions for all to authenticated
using(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid()))
with check(exists(select 1 from public.invoices i where i.id=invoice_id and i.owner_id=auth.uid()));
create policy "audit own read" on public.audit_log for select to authenticated using(actor_id=auth.uid());

create index if not exists collection_actions_schedule_idx on public.collection_actions(status,scheduled_for);
create index if not exists invoices_owner_due_idx on public.invoices(owner_id,status,due_date);
