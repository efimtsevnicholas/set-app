import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '../../../../lib/server/supabase-admin.js';
import { sendTransactionalEmail } from '../../../../lib/server/email.js';

export async function POST(req){
 if(req.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:'Unauthorized'},{status:401});
 const db=createSupabaseAdmin(), now=new Date().toISOString();
 const {data:actions,error}=await db.from('collection_actions').select('*, invoices!inner(*)').eq('status','pending').eq('requires_approval',false).lte('scheduled_for',now).limit(50); if(error) return NextResponse.json({error:error.message},{status:500});
 let sent=0;
 for(const action of actions||[]){const inv=action.invoices;if(!inv.client_email||inv.status==='paid') continue; try{
   await sendTransactionalEmail({to:inv.client_email,subject:action.subject||'Payment reminder',html:`<p>${action.body||'Payment reminder.'}</p><p>Invoice <strong>${inv.invoice_number}</strong> · Total €${Number(inv.total||0).toFixed(2)} · Due ${inv.due_date||'—'}</p>`});
   await db.from('collection_actions').update({status:'sent',sent_at:new Date().toISOString()}).eq('id',action.id); sent++;
 }catch(e){await db.from('collection_actions').update({status:'failed',metadata:{error:e.message}}).eq('id',action.id)}}
 return NextResponse.json({processed:(actions||[]).length,sent});
}
