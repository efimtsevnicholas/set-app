'use client';
import {useEffect,useState} from 'react';
import {createClient} from '../../lib/supabase-browser.js';
export default function Invite(){
 const [state,setState]=useState({loading:true,user:null,invite:null,error:''});
 useEffect(()=>{(async()=>{try{const id=new URLSearchParams(location.search).get('invite');if(!id)throw new Error('Invitation link is missing');const sb=createClient();const {data:{user}}=await sb.auth.getUser();if(!user){setState({loading:false,user:null,invite:{id},error:''});return}const {data,error}=await sb.from('project_invites').select('id,project_id,email,name,role,status').eq('id',id).single();if(error)throw error;setState({loading:false,user,invite:data,error:''})}catch(e){setState({loading:false,user:null,invite:null,error:e.message})}})()},[]);
 const accept=async()=>{try{const sb=createClient();const {error}=await sb.rpc('accept_project_invite',{invite_id:state.invite.id});if(error)throw error;location.href=`/?project=${state.invite.project_id}`}catch(e){setState(x=>({...x,error:e.message}))}};
 if(state.loading)return <main className="auth-page"><section><div className="brand">SET</div><p>Loading invitation…</p></section></main>;
 if(!state.user){const next=encodeURIComponent(`/invite?invite=${state.invite?.id||''}`);return <main className="auth-page"><section><div className="brand">SET</div><h1>Project invitation</h1><p>Sign in with the email address that received this invitation.</p><a className="primary full invite-login" href={`/login?next=${next}`}>Log in to accept</a>{state.error&&<p className="auth-status">{state.error}</p>}</section></main>}
 return <main className="auth-page"><section><div className="brand">SET</div><h1>Join project</h1><p>{state.invite?.name||state.invite?.email} · {state.invite?.role||'Team member'}</p><button className="primary full" onClick={accept}>Accept invitation</button>{state.error&&<p className="auth-status">{state.error}</p>}</section></main>
}
