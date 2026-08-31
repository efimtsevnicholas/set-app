'use client';
import {useEffect,useRef,useState} from 'react';
import {createClient} from './supabase-browser.js';

const isUuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v||''));
const dateOnly=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?v:null;
const toIso=(date,time)=>{try{return new Date(`${date||'2026-09-12'}T${time||'10:00'}:00`).toISOString()}catch{return new Date().toISOString()}};

export function useCloudCoreSync({ready,projects,setProjects,tasks,setTasks,events,setEvents,notify}){
 const [cloud,setCloud]=useState({enabled:false,ready:false,user:null});
 const muted=useRef(false); const prev=useRef({projects:[],tasks:[],events:[]});
 useEffect(()=>{if(!ready)return;let cancelled=false;let channel;
  (async()=>{try{
   const sb=createClient(); const {data:{user}}=await sb.auth.getUser(); if(!user||cancelled){setCloud({enabled:false,ready:true,user:null});return}
   const reload=async()=>{const [{data:ps},{data:ts},{data:es}]=await Promise.all([
    sb.from('projects').select('*').order('created_at',{ascending:false}),
    sb.from('tasks').select('*').order('created_at',{ascending:true}),
    sb.from('project_events').select('*').order('start_at',{ascending:true})
   ]); if(cancelled)return [];
    if(ps?.length){muted.current=true;
      setProjects(ps.map(p=>({...p,...(p.ui_payload||{}),id:p.id,name:p.name,client:p.client||'',location:p.location||'',date:p.shoot_date||(p.ui_payload?.date)||'Date not set',status:p.status,progress:p.progress||0,budget:Number(p.budget||0),spent:Number(p.spent||0)})));
      setTasks((ts||[]).map(t=>({...t.ui_payload,id:t.id,project:t.project_id,title:t.title,description:t.description||'',progress:t.progress||0,priority:t.priority||'Medium',done:t.status==='completed'})));
      setEvents((es||[]).map(e=>({...e.ui_payload,id:e.id,project:e.project_id,title:e.title,place:e.location||'',type:e.event_type||e.ui_payload?.type||'Production',date:(e.start_at||'').slice(0,10),time:(e.start_at||'').slice(11,16),endTime:(e.end_at||'').slice(11,16)})));
      setTimeout(()=>{muted.current=false},0);
    }
    return ps||[];
   };
   let cloudProjects=await reload();
   if(!cloudProjects.length&&projects.length){const map={};
    for(const p of projects){const {data,error}=await sb.from('projects').insert({owner_id:user.id,name:p.name,client:p.client||null,location:p.location||null,shoot_date:dateOnly(p.date),status:String(p.status||'pre-production').toLowerCase(),budget:Number(p.budget)||0,spent:Number(p.spent)||0,progress:Number(p.progress)||0,ui_payload:p}).select().single();if(!error&&data)map[p.id]=data.id}
    for(const t of tasks){const pid=map[t.project];if(pid)await sb.from('tasks').insert({owner_id:user.id,project_id:pid,title:t.title,description:t.description||'',deliverable_type:t.deliverableType||'General',progress:Number(t.progress)||0,status:t.done?'completed':'open',priority:t.priority||'Medium',ui_payload:{...t,project:pid}})}
    for(const e of events){const pid=map[e.project];if(pid)await sb.from('project_events').insert({project_id:pid,title:e.title,start_at:toIso(e.date,e.time),end_at:toIso(e.date,e.endTime||e.time),location:e.place||'',event_type:e.type||'Production',ui_payload:{...e,project:pid}})}
    await reload();notify?.('Local SET data migrated to cloud');
   }
   channel=sb.channel(`set-core-${user.id}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'projects'},reload)
    .on('postgres_changes',{event:'*',schema:'public',table:'tasks'},reload)
    .on('postgres_changes',{event:'*',schema:'public',table:'project_events'},reload).subscribe();
   setCloud({enabled:true,ready:true,user});
  }catch(e){console.warn('SET cloud sync fallback',e);setCloud({enabled:false,ready:true,user:null})}})();
  return()=>{cancelled=true;if(channel)createClient().removeChannel(channel)};
 },[ready]);

 useEffect(()=>{if(!cloud.enabled||!cloud.ready||muted.current)return;const timer=setTimeout(async()=>{const sb=createClient();for(const p of projects){if(!isUuid(p.id))continue;await sb.from('projects').upsert({id:p.id,owner_id:cloud.user.id,name:p.name,client:p.client||null,location:p.location||null,shoot_date:dateOnly(p.date),status:String(p.status||'pre-production').toLowerCase(),budget:Number(p.budget)||0,spent:Number(p.spent)||0,progress:Number(p.progress)||0,ui_payload:p})}const removed=prev.current.projects.filter(id=>!projects.some(p=>p.id===id));if(removed.length)await sb.from('projects').delete().in('id',removed);prev.current.projects=projects.filter(p=>isUuid(p.id)).map(p=>p.id)},450);return()=>clearTimeout(timer)},[projects,cloud.enabled,cloud.ready]);
 useEffect(()=>{if(!cloud.enabled||!cloud.ready||muted.current)return;const timer=setTimeout(async()=>{const sb=createClient();for(const t of tasks){if(!isUuid(t.id)||!isUuid(t.project))continue;await sb.from('tasks').upsert({id:t.id,owner_id:cloud.user.id,project_id:t.project,title:t.title,description:t.description||'',deliverable_type:t.deliverableType||'General',progress:Number(t.progress)||0,status:t.done?'completed':(Number(t.progress)>0?'in_progress':'open'),priority:t.priority||'Medium',ui_payload:t})}const removed=prev.current.tasks.filter(id=>!tasks.some(t=>t.id===id));if(removed.length)await sb.from('tasks').delete().in('id',removed);prev.current.tasks=tasks.filter(t=>isUuid(t.id)).map(t=>t.id)},450);return()=>clearTimeout(timer)},[tasks,cloud.enabled,cloud.ready]);
 useEffect(()=>{if(!cloud.enabled||!cloud.ready||muted.current)return;const timer=setTimeout(async()=>{const sb=createClient();for(const e of events){if(!isUuid(e.id)||!isUuid(e.project))continue;await sb.from('project_events').upsert({id:e.id,project_id:e.project,title:e.title,start_at:toIso(e.date,e.time),end_at:toIso(e.date,e.endTime||e.time),location:e.place||'',event_type:e.type||'Production',ui_payload:e})}const removed=prev.current.events.filter(id=>!events.some(e=>e.id===id));if(removed.length)await sb.from('project_events').delete().in('id',removed);prev.current.events=events.filter(e=>isUuid(e.id)).map(e=>e.id)},450);return()=>clearTimeout(timer)},[events,cloud.enabled,cloud.ready]);
 return cloud;
}

export function useCloudCollection({kind,localKey,seed=[],projectId=null}){
 const [items,setItems]=useState(()=>{if(typeof window==='undefined')return seed;try{return JSON.parse(localStorage.getItem(localKey)||'null')||seed}catch{return seed}});
 const [online,setOnline]=useState(false); const hydrated=useRef(false); const mute=useRef(false);
 useEffect(()=>{let channel;let dead=false;(async()=>{try{const sb=createClient();const {data:{user}}=await sb.auth.getUser();if(!user||dead){hydrated.current=true;return}
   const query=()=>{const q=sb.from('workspace_records').select('*').eq('kind',kind).eq('record_key','collection');return projectId?q.eq('project_id',projectId):q.is('project_id',null).eq('owner_id',user.id)};
   const {data}=await query().maybeSingle();if(data?.payload?.items){mute.current=true;setItems(data.payload.items);setTimeout(()=>mute.current=false,0)}else if(items.length){await sb.from('workspace_records').insert({owner_id:projectId?null:user.id,project_id:projectId||null,kind,record_key:'collection',payload:{items},created_by:user.id})}
   hydrated.current=true;setOnline(true);
   channel=sb.channel(`set-${kind}-${projectId||user.id}`).on('postgres_changes',{event:'*',schema:'public',table:'workspace_records',filter:projectId?`project_id=eq.${projectId}`:`owner_id=eq.${user.id}`},async()=>{const {data:d}=await query().maybeSingle();if(d?.payload?.items){mute.current=true;setItems(d.payload.items);setTimeout(()=>mute.current=false,0)}}).subscribe();
  }catch{hydrated.current=true}})();return()=>{dead=true;if(channel)createClient().removeChannel(channel)}},[kind,projectId]);
 useEffect(()=>{try{localStorage.setItem(localKey,JSON.stringify(items))}catch{}if(!hydrated.current||mute.current||!online)return;const timer=setTimeout(async()=>{try{const sb=createClient();const {data:{user}}=await sb.auth.getUser();if(!user)return;const payload={owner_id:projectId?null:user.id,project_id:projectId||null,kind,record_key:'collection',payload:{items},created_by:user.id,updated_at:new Date().toISOString()};await sb.from('workspace_records').upsert(payload,{onConflict:projectId?'project_id,kind,record_key':'owner_id,kind,record_key'})}catch{}},350);return()=>clearTimeout(timer)},[items,online,kind,projectId,localKey]);
 return [items,setItems,{online}];
}
