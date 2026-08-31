import { NextResponse } from 'next/server';
import { requireProUser } from '../../../../lib/server/access.js';
import { sendTransactionalEmail } from '../../../../lib/server/email.js';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function attachmentFromDeliverable(d){
  if(!d?.data || !d?.name) return null;
  const m = String(d.data).match(/^data:([^;]+);base64,(.+)$/);
  if(!m) return null;
  const content = Buffer.from(m[2], 'base64');
  if(content.length > MAX_FILE_BYTES) return null;
  return { filename: d.name, content };
}

export async function POST(req){
  try{
    await requireProUser();
    const body = await req.json();
    const task = body?.task || {}; const project = body?.project || {}; const recipients = Array.isArray(body?.recipients)?body.recipients:[];
    if(!task.title) return NextResponse.json({error:'Task title is required'},{status:400});
    const emails = [...new Set(recipients.map(r=>r?.email).filter(Boolean))];
    const attachments = (task.deliverables||[]).map(attachmentFromDeliverable).filter(Boolean);
    if(!emails.length) return NextResponse.json({ok:true,delivered:0,reason:'NO_RECIPIENT_EMAILS',attachments:attachments.length});
    const files = (task.deliverables||[]).map(d=>`<li>${esc(d.name||'Deliverable')}</li>`).join('');
    const html = `<div style="font-family:Helvetica Neue,Helvetica,Arial,sans-serif;color:#111"><p style="font-size:12px;letter-spacing:.12em">SET · ${esc(project.name||'PROJECT')}</p><h1 style="font-size:24px">Task completed</h1><p><strong>${esc(task.title)}</strong> is now 100% complete.</p><p>Deliverable: ${esc(task.deliverableType||'General')}</p>${files?`<p>Files:</p><ul>${files}</ul>`:''}<p style="color:#666">This update was sent automatically to assigned teammates from SET.</p></div>`;
    await sendTransactionalEmail({to:emails,subject:`SET · Completed: ${task.title}`,html,attachments});
    return NextResponse.json({ok:true,delivered:emails.length,attachments:attachments.length});
  }catch(error){
    const status = error?.message==='SUBSCRIPTION_REQUIRED'?402:500;
    return NextResponse.json({error:error?.message||'Unable to send task notification'},{status});
  }
}
