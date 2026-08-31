-- SET v0.7 — billing delivery + reconciliation metadata
alter table public.invoices
  add column if not exists client_name text,
  add column if not exists client_email text,
  add column if not exists client_address text,
  add column if not exists currency text not null default 'EUR';

create index if not exists invoices_provider_invoice_idx on public.invoices(provider_invoice_id);
create index if not exists payment_events_invoice_idx on public.payment_events(invoice_id,occurred_at desc);

-- Formal notices remain manual-approval only. This constraint prevents accidental auto-approval.
alter table public.collection_actions drop constraint if exists formal_notice_requires_approval;
alter table public.collection_actions add constraint formal_notice_requires_approval check (
  action_type not in ('formal_notice_draft','formal_notice_sent') or requires_approval = true
);
