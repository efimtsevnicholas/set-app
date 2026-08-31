import {NextResponse} from 'next/server';
import {requireProUser} from '../../../../lib/server/access.js';
import {createSupabaseAdmin} from '../../../../lib/server/supabase-admin.js';
import {computeDocumentTotals} from '../../../../lib/server/finance.js';

const allowedStatuses=new Set(['draft','sent','paid','cancelled']);

export async function PUT(req,{params}){
 try{
  const user=await requireProUser(), {id}=await params, db=createSupabaseAdmin(), body=await req.json();
  const {data:existing,error:existingError}=await db.from('invoices').select('*').eq('id',id).eq('owner_id',user.id).single();
  if(existingError)throw existingError;
  const calc=computeDocumentTotals(body.items||[]);
  const patch={client_name:body.client_name,client_email:body.client_email||null,client_address:body.client_address||null,issue_date:body.issue_date||existing.issue_date,due_date:body.due_date||existing.due_date,subtotal:calc.subtotal,vat:calc.vat,total:calc.total,notes:body.notes||null};
  patch.balance_due=existing.status==='paid'?0:calc.total;
  const {data:invoice,error}=await db.from('invoices').update(patch).eq('id',id).eq('owner_id',user.id).select().single(); if(error)throw error;
  await db.from('invoice_items').delete().eq('invoice_id',id);
  if(calc.items.length){const {error:itemError}=await db.from('invoice_items').insert(calc.items.map(x=>({...x,invoice_id:id})));if(itemError)throw itemError}
  await db.from('audit_log').insert({actor_id:user.id,entity_type:'invoice',entity_id:id,action:'edited',metadata:{invoice_number:existing.invoice_number,previous_total:existing.total,total:calc.total,previous_status:existing.status}});
  return NextResponse.json({invoice:{...invoice,invoice_items:calc.items}});
 }catch(e){return NextResponse.json({error:e.message},{status:e.message==='UNAUTHORIZED'?401:e.message==='SUBSCRIPTION_REQUIRED'?402:500})}
}

export async function PATCH(req,{params}){
 try{
  const user=await requireProUser(), {id}=await params, db=createSupabaseAdmin(), body=await req.json(), status=String(body.status||'').toLowerCase();
  if(!allowedStatuses.has(status))return NextResponse.json({error:'Invalid invoice status'},{status:400});
  const {data:existing,error:existingError}=await db.from('invoices').select('*').eq('id',id).eq('owner_id',user.id).single();if(existingError)throw existingError;
  const patch={status};
  if(status==='paid'){patch.balance_due=0;patch.paid_at=new Date().toISOString()}
  else {patch.paid_at=null;patch.balance_due=Number(existing.total||0)}
  if(status==='sent'&&!existing.sent_at)patch.sent_at=new Date().toISOString();
  const {data:invoice,error}=await db.from('invoices').update(patch).eq('id',id).eq('owner_id',user.id).select().single();if(error)throw error;
  await db.from('audit_log').insert({actor_id:user.id,entity_type:'invoice',entity_id:id,action:'status_changed',metadata:{invoice_number:existing.invoice_number,from:existing.status,to:status}});
  return NextResponse.json({invoice});
 }catch(e){return NextResponse.json({error:e.message},{status:e.message==='UNAUTHORIZED'?401:e.message==='SUBSCRIPTION_REQUIRED'?402:500})}
}
