import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';

function admin(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}})}
async function currentUser(req){const auth=req.headers.get('authorization'); if(!auth?.startsWith('Bearer ')) return null; const {data}=await admin().auth.getUser(auth.slice(7)); return data?.user||null}

export async function POST(req){
 try{
  const body=await req.json(); const provider=String(body.provider||'').toLowerCase(); const to=String(body.to||'').trim(); const text=String(body.text||'').trim();
  if(!to||!text) return NextResponse.json({error:'Missing recipient or message'},{status:400});
  // Auth is intentionally optional for the current UI shell; once all clients send a bearer token, make this mandatory.
  if(provider==='whatsapp'){
   const token=process.env.WHATSAPP_ACCESS_TOKEN?.trim(); const phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
   if(!token||!phoneId) return NextResponse.json({error:'WhatsApp Business is not connected'},{status:503});
   const digits=to.replace(/\D/g,'');
   const r=await fetch(`https://graph.facebook.com/v23.0/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:digits,type:'text',text:{body:text}})});
   const data=await r.json(); if(!r.ok) return NextResponse.json({error:data?.error?.message||'WhatsApp send failed'},{status:502}); return NextResponse.json({ok:true,provider,id:data?.messages?.[0]?.id||null});
  }
  if(provider==='telegram'){
   const token=process.env.TELEGRAM_BOT_TOKEN?.trim(); if(!token) return NextResponse.json({error:'Telegram is not connected'},{status:503});
   const chatId=(body.chat_id||to).toString().replace(/^@/,'');
   const r=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chatId,text})});
   const data=await r.json(); if(!r.ok||!data.ok) return NextResponse.json({error:data?.description||'Telegram send failed'},{status:502}); return NextResponse.json({ok:true,provider,id:data?.result?.message_id||null});
  }
  if(provider==='email'){
   const key=process.env.RESEND_API_KEY?.trim(); const from=process.env.SET_EMAIL_FROM?.trim(); if(!key||!from) return NextResponse.json({error:'Email is not connected'},{status:503});
   const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject:body.subject||'Message from SET',text})});
   const data=await r.json(); if(!r.ok) return NextResponse.json({error:data?.message||'Email send failed'},{status:502}); return NextResponse.json({ok:true,provider,id:data?.id||null});
  }
  return NextResponse.json({error:'Unsupported provider'},{status:400});
 }catch(e){return NextResponse.json({error:e.message||'Message send failed'},{status:500})}
}
