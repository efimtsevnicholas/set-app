'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../lib/supabase-browser';

const modules=['Overview','Projects','Clients','Moodboards','Casting','Crew','Schedule','Tasks','Expenses','Invoices','Files','Messages','Call Sheet','AI Assistant'];
const fallback=[
 {name:'Paris Fashion Campaign',type:'CAMPAIGN',date:'02 OCT 2026',status:'PRE-PRODUCTION',progress:72},
 {name:'Normandy Editorial',type:'EDITORIAL',date:'15 OCT 2026',status:'PLANNING',progress:38},
 {name:'Beauty Test — Paris',type:'MODEL TEST',date:'21 OCT 2026',status:'CONFIRMED',progress:54}
];

export default function Page(){
 const [active,setActive]=useState('Overview');
 const [projects,setProjects]=useState([]);
 const [query,setQuery]=useState('');
 const [loading,setLoading]=useState(true);
 const [notice,setNotice]=useState('');
 const [user,setUser]=useState(null);

 useEffect(()=>{let live=true;(async()=>{
  try{
   const s=createClient();
   const {data:{user:u}}=await s.auth.getUser();
   if(!live)return;
   setUser(u||null);
   if(!u){setProjects(fallback);setNotice('Sign in to sync your production workspace.');return;}
   const {data,error}=await s.from('projects').select('*').order('created_at',{ascending:false});
   if(error) throw error;
   setProjects((data||[]).map(normalizeProject));
  }catch(e){setProjects(fallback);setNotice('Workspace is available in preview mode.');}
  finally{if(live)setLoading(false)}
 })();return()=>{live=false}},[]);

 const visible=useMemo(()=>projects.filter(p=>(p.name||'').toLowerCase().includes(query.toLowerCase())),[projects,query]);

 async function addProject(){
  if(!user){location.href='/login?next=/';return;}
  const name=prompt('Project name'); if(!name)return;
  try{
   const s=createClient();
   const payload={name,status:'lead'};
   const {data,error}=await s.from('projects').insert(payload).select().single();
   if(error)throw error;
   setProjects(v=>[normalizeProject(data),...v]); setNotice('');
  }catch(e){setNotice('Could not create project: '+e.message)}
 }
 async function signOut(){const s=createClient();await s.auth.signOut();location.href='/login';}

 return <main className="shell">
  <header><div className="brand">SET</div><div className="headerRight"><span>CREATIVE PRODUCTION OS</span>{user?<button className="textBtn" onClick={signOut}>LOG OUT</button>:<button className="textBtn" onClick={()=>location.href='/login'}>LOG IN</button>}</div></header>
  <div className="layout"><aside><nav>{modules.map(m=><button key={m} onClick={()=>setActive(m)} className={active===m?'active':''}>{m}</button>)}</nav><div className="asideFoot">EFIMTSEV / PARIS<br/>V2.3</div></aside>
  <section className="content"><div className="eyebrow">WORKSPACE / {active.toUpperCase()}</div><div className="hero"><h1>{active}</h1><button className="primary" onClick={addProject}>+ NEW PROJECT</button></div>
  {notice&&<p className="auth-status">{notice}</p>}
  {active==='Overview'||active==='Projects'?<><div className="metrics"><article><b>{loading?'—':projects.length}</b><span>ACTIVE PROJECTS</span></article><article><b>07</b><span>TASKS DUE</span></article><article><b>€5,000</b><span>ACTIVE BUDGET</span></article><article><b>03</b><span>UPCOMING SHOOTS</span></article></div>
  <div className="toolbar"><h2>PROJECTS</h2><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="SEARCH PROJECTS"/></div>
  <div className="table"><div className="row head"><span>PROJECT</span><span>TYPE</span><span>DATE</span><span>STATUS</span><span>PROGRESS</span></div>{visible.map((p,i)=><div className="row" key={p.id||i}><strong>{p.name}</strong><span>{p.type}</span><span>{p.date}</span><span>{p.status}</span><span>{p.progress}%</span></div>)}</div></>:<Module name={active}/>} </section></div>
 </main>
}
function normalizeProject(p){return {id:p.id,name:p.name||p.title||'Untitled project',type:(p.type||'PROJECT').toString().toUpperCase(),date:p.date||p.shoot_date||p.start_date||'TBD',status:(p.status||'LEAD').toString().replaceAll('_',' ').toUpperCase(),progress:Number(p.progress||0)}}
function Module({name}){const copy={Moodboards:'References, approvals, likes and final selections.',Casting:'Candidates, shortlist, selected talent and final cast.',Crew:'Creative database, availability, rates and project teams.',Schedule:'Production events and shoot-day timeline.',Tasks:'Project tasks, owners and deadlines.',Expenses:'Project expenses and budget control.',Invoices:'Estimates, invoices and payment status.',Files:'Production files and project media.',Messages:'Project conversations and approvals.','Call Sheet':'Generate and share production call sheets.','AI Assistant':'Turn a project brief into crew, casting, schedule and budget suggestions.',Clients:'Client CRM linked to every production.'}[name]||'Project workspace.'; return <div className="module"><div><div className="eyebrow">SET / {name.toUpperCase()}</div><h2>{copy}</h2></div><button className="outline">OPEN WORKSPACE</button></div>}
