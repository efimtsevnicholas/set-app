'use client';
import { useEffect, useState } from 'react';

export default function SubscribePage(){
  const [status,setStatus]=useState(null); const [busy,setBusy]=useState(''); const [error,setError]=useState('');
  useEffect(()=>{fetch('/api/billing/status',{cache:'no-store'}).then(async r=>{if(r.status===401){location.href='/login';return}const j=await r.json();setStatus(j);if(j.hasAccess)location.href='/'}).catch(()=>setError('Unable to check subscription.'));},[]);
  async function checkout(planCode){setBusy(planCode);setError('');try{const r=await fetch('/api/billing/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({planCode})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Checkout failed');location.href=j.url}catch(e){setError(e.message);setBusy('')}}
  return <main className="paywall"><section className="paywall-card"><div className="brand">SET</div><small>MEMBERSHIP REQUIRED</small><h1>Choose your SET plan</h1><p>Start with 7 days free. An active trial or subscription is required to access SET.</p><div className="paywall-plans"><button disabled={!!busy} onClick={()=>checkout('pro_monthly')}><b>Monthly</b><strong>€9.99</strong><span>per month · 7-day free trial</span></button><button disabled={!!busy} onClick={()=>checkout('pro_yearly')}><b>Yearly</b><strong>€99.99</strong><span>per year · 7-day free trial · best value</span></button></div>{busy&&<p>Opening secure checkout…</p>}{error&&<p className="paywall-error">{error}</p>}<small>Without an active trial or subscription, Dashboard, Projects, Finance and production tools remain locked.</small></section></main>
}
