import {NextResponse} from 'next/server';
import {requireProUser} from '../../../../lib/server/access.js';
import {createSupabaseAdmin} from '../../../../lib/server/supabase-admin.js';
import {sendTransactionalEmail} from '../../../../lib/server/email.js';

export async function POST(req){
 try{
  const user=await requireProUser();const body=await req.json();const projectId=body?.projectId;const items=Array.isArray(body?.items)?body.items:[];
  if(!projectId||!items.length)return NextResponse.json({error:'Project and selected models are required'},{status:400});
  const db=createSupabaseAdmin();const {data:project,error}=await db.from('projects').select('id,name,owner_id').eq('id',projectId).single();
  if(error||!project||project.owner_id!==user.id)return NextResponse.json({error:'Project not found or access denied'},{status:403});
  const token=crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','').slice(0,12);
  const payload={projectName:body.projectName||project.name,items,createdAt:new Date().toISOString()};
  const {error:saveError}=await db.from('workspace_records').insert({owner_id:user.id,project_id:projectId,kind:'casting-share',record_key:token,payload,created_by:user.id});
  if(saveError)throw saveError;
  const base=(process.env.NEXT_PUBLIC_APP_URL||new URL(req.url).origin).replace(/\/$/,'');const url=`${base}/casting/share/${token}`;
  const email=String(body.email||'').trim();
  if(email){
   await sendTransactionalEmail({to:email,subject:`SET · Casting selection · ${payload.projectName}`,replyTo:user.email,html:`<div style="font-family:Helvetica Neue,Helvetica,Arial,sans-serif;color:#111"><p style="font-size:12px;letter-spacing:.12em">SET</p><h1 style="font-size:26px">Casting selection</h1><p>${String(body.message||'Please review the selected models.').replaceAll('<','&lt;')}</p><p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;text-decoration:none;border-radius:8px">View casting</a></p><p style="font-size:12px;color:#777">No SET account is required to open this link.</p></div>`});
  }
  return NextResponse.json({ok:true,url,token});
 }catch(e){return NextResponse.json({error:e?.message||'Could not create casting share'},{status:e?.message==='UNAUTHORIZED'?401:e?.message==='SUBSCRIPTION_REQUIRED'?402:500})}
}
