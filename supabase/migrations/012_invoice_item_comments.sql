-- SET v1.0.5: optional line-item comments for invoices and quotes
alter table public.invoice_items add column if not exists comment text;
alter table public.quote_items add column if not exists comment text;
