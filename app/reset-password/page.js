'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [ready, setReady] = useState(false);
  useEffect(() => { (async()=>{const supabase=createClient();const code=new URLSearchParams(window.location.search).get('code');if(code){const {error}=await supabase.auth.exchangeCodeForSession(code);if(error){setStatus('RESET LINK IS INVALID OR EXPIRED.');return}}const {data}=await supabase.auth.getSession();if(!data.session){setStatus('OPEN THIS PAGE FROM YOUR PASSWORD RESET EMAIL.');return}setReady(true)})() }, []);

  async function save(event) {
    event.preventDefault();
    try {
      const supabase = createClient();
      const result = await supabase.auth.updateUser({ password });
      if (result.error) throw result.error;
      setStatus('PASSWORD UPDATED.');
      setTimeout(() => { window.location.href = '/'; }, 700);
    } catch (error) {
      setStatus(String(error.message || 'Could not update password').toUpperCase());
    }
  }

  return <main className="loginPage">
    <header className="loginHeader"><a className="loginLogo" href="/">SET</a><span>ACCOUNT SECURITY</span></header>
    <section className="loginGrid">
      <div className="loginIntro"><div className="loginKicker">SET / SECURITY</div><h1>NEW PASSWORD.</h1></div>
      <div className="loginPanel">
        <div className="loginPanelTop"><span>RESET PASSWORD</span><span>01</span></div>
        <form onSubmit={save}>
          <label>NEW PASSWORD<input type="password" minLength="8" required value={password} onChange={event => setPassword(event.target.value)} /></label>
          <button className="loginSubmit" disabled={!ready}>SAVE PASSWORD →</button>
        </form>
        {status && <div className="loginStatus">{status}</div>}
      </div>
    </section>
  </main>;
}
