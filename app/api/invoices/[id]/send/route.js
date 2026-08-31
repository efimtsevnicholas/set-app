import { NextResponse } from 'next/server';
import { requireUser } from '../../../../../lib/server/auth.js';
import { createSupabaseAdmin } from '../../../../../lib/server/supabase-admin.js';
import { sendTransactionalEmail } from '../../../../../lib/server/email.js';
import { buildInvoicePdf } from '../../../../../lib/server/invoice-pdf.js';

export async function POST(req,{params}){
 try{
  const user=await requireUser(), {id}=await params, db=createSupabaseAdmin(), body=await req.json().catch(()=>({}));
  const {data:invoice,error}=await db.from('invoices').select('*').eq('id',id).eq('owner_id',user.id).single(); if(error) throw error;
  if(!invoice.client_email) return NextResponse.json({error:'Client email missing'},{status:400});
  const {data:items}=await db.from('invoice_items').select('*').eq('invoice_id',id).order('sort_order');
  const [{data:profile},{data:business}]=await Promise.all([db.from('profiles').select('*').eq('id',user.id).maybeSingle(),db.from('business_profiles').select('*').eq('user_id',user.id).maybeSingle()]);
  const owner={...profile,...business,display_name:business?.business_name||profile?.company_name||profile?.full_name,email:business?.email||user.email};
  const pdf=await buildInvoicePdf({invoice,items:items||[],owner:owner||{},client:{name:invoice.client_name,email:invoice.client_email,address:invoice.client_address}});
  const subject=body.subject||`Invoice ${invoice.invoice_number}`;
  const html=body.html||`<p>Hello,</p><p>Please find invoice <strong>${invoice.invoice_number}</strong> attached.</p><p>Total: <strong>€${Number(invoice.total||0).toFixed(2)}</strong></p><p>Due: ${invoice.due_date||'—'}</p>`;
  const result=await sendTransactionalEmail({to:invoice.client_email,subject,html,replyTo:user.email,attachments:[{filename:`${invoice.invoice_number||'invoice'}.pdf`,content:pdf}]});
  await db.from('invoices').update({status:'sent',sent_at:new Date().toISOString()}).eq('id',id);
  const {count}=await db.from('collection_actions').select('id',{count:'exact',head:true}).eq('invoice_id',id);
  if(!count && invoice.due_date){
    const due=new Date(`${invoice.due_date}T09:00:00Z`), at=(days)=>new Date(due.getTime()+days*86400000).toISOString();
    await db.from('collection_actions').insert([
      {invoice_id:id,action_type:'friendly_reminder',scheduled_for:at(-7),requires_approval:false,subject:'Upcoming invoice due date',body:'A friendly reminder that this invoice is due soon.'},
      {invoice_id:id,action_type:'due_reminder',scheduled_for:at(0),requires_approval:false,subject:'Invoice due today',body:'This invoice is due today.'},
      {invoice_id:id,action_type:'overdue_reminder',scheduled_for:at(1),requires_approval:false,subject:'Invoice overdue',body:'This invoice is now overdue.'},
      {invoice_id:id,action_type:'overdue_reminder',scheduled_for:at(7),requires_approval:false,subject:'Payment reminder',body:'This invoice remains overdue.'},
      {invoice_id:id,action_type:'formal_notice_draft',scheduled_for:at(14),requires_approval:true,subject:'Mise en demeure — review required',body:'Draft only. Owner approval is required before sending.'}
    ]);
  }
  await db.from('audit_log').insert({actor_id:user.id,entity_type:'invoice',entity_id:id,action:'invoice_sent',metadata:{email_id:result?.data?.id||null}});
  return NextResponse.json({ok:true});
 }catch(e){return NextResponse.json({error:e.message},{status:e.message==='UNAUTHORIZED'?401:500})}
}
