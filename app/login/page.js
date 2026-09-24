'use client';
import {useState} from 'react';

export default function Login(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[mode,setMode]=useState('login'),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault();if(busy)return;setBusy(true);setStatus('');try{if(mode==='login'){const res=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const json=await res.json();if(!res.ok)throw new Error(json.error||'Could not log in');location.href=new URLSearchParams(location.search).get('next')||'/';return}const res=await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const json=await res.json();if(!res.ok)throw new Error(json.error||'Could not create account');if(json.needsConfirmation)setStatus('CHECK YOUR EMAIL TO CONFIRM YOUR ACCOUNT.');else location.href='/'}catch(err){setStatus(String(err.message||'Could not continue.').toUpperCase())}finally{setBusy(false)}}
 async function reset(){if(!email){setStatus('ENTER YOUR EMAIL ADDRESS FIRST.');return}setBusy(true);try{const r=await fetch('/api/auth/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const j=await r.json();if(!r.ok)throw new Error(j.error);setStatus('PASSWORD RESET EMAIL SENT.')}catch(e){setStatus(String(e.message||'Could not reset password').toUpperCase())}finally{setBusy(false)}}
 return <main className="loginPage">
  <header className="loginHeader"><a className="loginLogo" href="/">SET</a><span>CREATIVE PRODUCTION OS</span></header>
  <section className="loginGrid">
   <div className="loginIntro"><div className="loginKicker">SET / PARIS</div><h1>{mode==='login'?'WELCOME BACK.':'CREATE YOUR WORKSPACE.'}</h1><p>Projects, casting, crew, schedules, expenses, files and client production — in one place.</p><div className="loginIndex"><span>01 PROJECTS</span><span>02 CASTING</span><span>03 PRODUCTION</span><span>04 FINANCE</span></div></div>
   <div className="loginPanel"><div className="loginPanelTop"><span>{mode==='login'?'ACCOUNT LOGIN':'NEW ACCOUNT'}</span><span>{mode==='login'?'01':'02'}</span></div>
    <form onSubmit={submit}>
     <label>EMAIL ADDRESS<input autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
     <label>PASSWORD<input autoComplete={mode==='login'?'current-password':'new-password'} type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength="6" required/></label>
     <button className="loginSubmit" disabled={busy}>{busy?'PLEASE WAIT…':mode==='login'?'LOG IN →':'CREATE ACCOUNT →'}</button>
    </form>
    {status&&<div className="loginStatus">{status}</div>}{mode==='login'&&<button className="loginSwitch" type="button" disabled={busy} onClick={reset}>FORGOT PASSWORD?</button>}
    <button className="loginSwitch" type="button" onClick={()=>{setMode(mode==='login'?'signup':'login');setStatus('')}}>{mode==='login'?'NO ACCOUNT? CREATE ONE':'ALREADY REGISTERED? LOG IN'}</button>
   </div>
  </section>
  <footer className="loginFooter"><span>SET © 2026</span><span>FOR CREATIVE PRODUCTIONS</span><span>PARIS / WORLDWIDE</span></footer>
 </main>
}