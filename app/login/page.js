'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase-browser';
export default function Login(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [mode,setMode]=useState('login'); const [status,setStatus]=useState('');
 async function submit(e){e.preventDefault();setStatus('');try{const s=createClient(); const r=mode==='login'?await s.auth.signInWithPassword({email,password}):await s.auth.signUp({email,password,options:{emailRedirectTo:`${location.origin}/auth/callback`}}); if(r.error)throw r.error; setStatus(mode==='login'?'Signed in.':'Check your email to confirm your account.'); if(mode==='login')location.href='/';}catch(err){setStatus(err.message)}}
 return <main className="auth-page"><section><div className="brand">SET</div><h1>{mode==='login'?'Welcome back':'Create your SET account'}</h1><p>One workspace for creative productions.</p><form onSubmit={submit}><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password (minimum 6 characters)" value={password} onChange={e=>setPassword(e.target.value)} minLength="6" required/><button className="primary full">{mode==='login'?'Log In':'Create Account'}</button></form>{status&&<p className="auth-status">{status}</p>}<button className="link-button" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Create a new account':'Already have an account? Log in'}</button></section></main>
}
