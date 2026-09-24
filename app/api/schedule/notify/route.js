import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTransactionalEmail } from '../../../../lib/server/email.js';

const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>v?new Intl.DateTimeFormat('en-GB',{dateStyle:'full',timeStyle:'short'}).format(new Date(v)):'—';

export async function POST(req){
 try{
  const auth=req.headers.get('authorization')||'';
  const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!token)return NextResponse.json({error:'Unauthorized'},{status:401});
  const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false}});
  const {data:{user}}=await db.auth.getUser(token);
  if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json(),event=body?.event||{},action=body?.action==='updated'?'updated':'created';
  if(!event.id||!event.project_id)return NextResponse.json({error:'Event is required'},{status:400});
  const [{data:project},{data:members},{data:ownerProfile}]=await Promise.all([
   db.from('projects').select('id,name,owner_id').eq('id',event.project_id).single(),
   db.from('project_members').select('email,name,user_id').eq('project_id',event.project_id),
   db.from('profiles').select('email').eq('id',user.id).maybeSingle()
  ]);
  if(!project)return NextResponse.json({error:'Project unavailable'},{status:403});
  const emails=[...new Set([user.email,ownerProfile?.email,...(members||[]).map(x=>x.email)].filter(Boolean).map(x=>String(x).trim().toLowerCase()))];
  if(!emails.length)return NextResponse.json({ok:true,delivered:0});
  const title=event.title||'Production event';
  const html=`<div style="font-family:Helvetica Neue,Helvetica,Arial,sans-serif;color:#111;max-width:620px"><p style="font-size:11px;letter-spacing:.14em">SET · ${esc(project.name||'PROJECT')}</p><h1 style="font-size:28px;font-weight:500">Event ${action}</h1><h2 style="font-size:20px">${esc(title)}</h2><p><b>When</b><br>${esc(fmt(event.start_at))}${event.end_at?' — '+esc(fmt(event.end_at)):''}</p>${event.location?`<p><b>Location</b><br>${esc(event.location)}</p>`:''}${event.address?`<p><b>Address</b><br>${esc(event.address)}</p>`:''}${event.description?`<p><b>Agenda</b><br>${esc(event.description)}</p>`:''}<p style="color:#666;font-size:12px">SET automatically sent this production schedule update to the project team.</p></div>`;
  await sendTransactionalEmail({to:emails,subject:`SET · ${action==='created'?'New event':'Schedule updated'} · ${title}`,html});
  return NextResponse.json({ok:true,delivered:emails.length});
 }catch(e){return NextResponse.json({error:e?.message||'Unable to notify team'},{status:500})}
}