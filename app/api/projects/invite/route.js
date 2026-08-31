import { NextResponse } from 'next/server';
import { requireProUser } from '../../../../lib/server/access.js';
import { createSupabaseAdmin } from '../../../../lib/server/supabase-admin.js';
import { sendTransactionalEmail } from '../../../../lib/server/email.js';

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function POST(req){
 try{
  const user=await requireProUser(); const body=await req.json();
  const projectId=body?.projectId; const email=String(body?.email||'').trim().toLowerCase(); const name=String(body?.name||'').trim(); const role=String(body?.role||'Crew').trim();
  if(!projectId||!email) return NextResponse.json({error:'Project and email are required'},{status:400});
  const db=createSupabaseAdmin();
  const {data:project,error:pe}=await db.from('projects').select('id,name,owner_id').eq('id',projectId).single();
  if(pe||!project||project.owner_id!==user.id) return NextResponse.json({error:'Project not found or access denied'},{status:403});
  const {data:invite,error}=await db.from('project_invites').upsert({project_id:projectId,email,name:name||email.split('@')[0],role,status:'invited',invited_by:user.id,updated_at:new Date().toISOString()},{onConflict:'project_id,email'}).select().single();
  if(error) throw error;
  const appUrl=(process.env.NEXT_PUBLIC_APP_URL||'').replace(/\/$/,''); const acceptUrl=`${appUrl}/invite?invite=${invite.id}`;
  let emailSent=false; let emailWarning=null;
  try{await sendTransactionalEmail({to:email,subject:`SET · Invitation to ${project.name}`,html:`<div style="font-family:Helvetica Neue,Helvetica,Arial,sans-serif;color:#111"><p style="font-size:12px;letter-spacing:.12em">SET</p><h1 style="font-size:24px">You’re invited to a project</h1><p><strong>${esc(project.name)}</strong></p><p>Role: ${esc(role)}</p><p><a href="${acceptUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px">Accept invitation</a></p><p style="color:#666;font-size:12px">Sign in to SET using ${esc(email)} to accept.</p></div>`});emailSent=true}catch(e){emailWarning=e?.message||'Email provider is not configured'}
  return NextResponse.json({ok:true,invite,emailSent,emailWarning,acceptUrl});
 }catch(error){const status=error?.message==='SUBSCRIPTION_REQUIRED'?402:500;return NextResponse.json({error:error?.message||'Unable to create invitation'},{status})}
}
