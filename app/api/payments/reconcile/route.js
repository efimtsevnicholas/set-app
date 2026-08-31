import { NextResponse } from 'next/server';
import { requireUser } from '../../../../lib/server/auth.js';
import { createSupabaseAdmin } from '../../../../lib/server/supabase-admin.js';

export async function POST(req){
 try{const user=await requireUser(), {invoiceId,amount,reference,paidAt}=await req.json(), db=createSupabaseAdmin();
  const {data:invoice,error}=await db.from('invoices').select('*').eq('id',invoiceId).eq('owner_id',user.id).single(); if(error) throw error;
  const paid=Number(amount); if(!Number.isFinite(paid)||paid<=0) return NextResponse.json({error:'Invalid amount'},{status:400});
  await db.from('payment_events').insert({invoice_id:invoiceId,owner_id:user.id,provider:'manual',provider_event_id:reference||null,event_type:'manual_payment',amount:paid,currency:invoice.currency||'EUR',payload:{reference}});
  await db.rpc('refresh_invoice_balance',{target:invoiceId});
  if(paidAt) await db.from('invoices').update({paid_at:paidAt}).eq('id',invoiceId).eq('status','paid');
  await db.from('audit_log').insert({actor_id:user.id,entity_type:'invoice',entity_id:invoiceId,action:'payment_reconciled',metadata:{amount:paid,reference}});
  const {data:updated}=await db.from('invoices').select('status,amount_paid,balance_due').eq('id',invoiceId).single();
  return NextResponse.json({ok:true,invoice:updated});
 }catch(e){return NextResponse.json({error:e.message},{status:e.message==='UNAUTHORIZED'?401:500})}
}
