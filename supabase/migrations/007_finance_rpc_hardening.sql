-- Restrict privileged finance RPCs to the server-side service role.
revoke all on function public.next_invoice_number(uuid) from public, anon, authenticated;
revoke all on function public.refresh_invoice_balance(uuid) from public, anon, authenticated;
revoke all on function public.queue_invoice_collection_actions(uuid) from public, anon, authenticated;
grant execute on function public.next_invoice_number(uuid) to service_role;
grant execute on function public.refresh_invoice_balance(uuid) to service_role;
grant execute on function public.queue_invoice_collection_actions(uuid) to service_role;
