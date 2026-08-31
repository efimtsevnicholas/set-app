import { NextResponse } from 'next/server';
import { requireProUser } from '../../../../../lib/server/access.js';
import { createSupabaseAdmin } from '../../../../../lib/server/supabase-admin.js';
import { buildInvoicePdf } from '../../../../../lib/server/invoice-pdf.js';

export async function GET(_req,{params}){
 try{const user=await requireProUser(), {id}=await params, db=createSupabaseAdmin();
  const {data:invoice,error}=await db.from('invoices').select('*').eq('id',id).eq('owner_id',user.id).single(); if(error) throw error;
  const {data:items}=await db.from('invoice_items').select('*').eq('invoice_id',id).order('sort_order');
  const [{data:profile},{data:business}]=await Promise.all([db.from('profiles').select('*').eq('id',user.id).maybeSingle(),db.from('business_profiles').select('*').eq('user_id',user.id).maybeSingle()]);
  const owner={...profile,...business,display_name:business?.business_name||profile?.company_name||profile?.full_name,email:business?.email||user.email};
  const bytes=await buildInvoicePdf({invoice,items:items||[],owner:owner||{},client:{name:invoice.client_name,email:invoice.client_email,address:invoice.client_address}});
  return new NextResponse(bytes,{headers:{'Content-Type':'application/pdf','Content-Disposition':`inline; filename="${invoice.invoice_number||'invoice'}.pdf"`}})
 }catch(e){return NextResponse.json({error:e.message},{status:e.message==='UNAUTHORIZED'?401:e.message==='SUBSCRIPTION_REQUIRED'?402:500})}
}
