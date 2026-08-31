import {createSupabaseAdmin} from '../../../../lib/server/supabase-admin.js';
import './share.css';

export default async function CastingSharePage({params}){
 const {token}=await params;const db=createSupabaseAdmin();
 const {data}=await db.from('workspace_records').select('payload,updated_at').eq('kind','casting-share').eq('record_key',token).maybeSingle();
 if(!data)return <main className="public-casting"><div className="public-empty"><b>SET</b><h1>Casting link unavailable</h1><p>This selection may have expired or been removed.</p></div></main>;
 const payload=data.payload||{},items=Array.isArray(payload.items)?payload.items:[];
 return <main className="public-casting"><header><div><b>SET</b><small>CASTING SELECTION</small></div><h1>{payload.projectName||'Casting'}</h1><p>{items.length} selected model{items.length===1?'':'s'}</p></header><section className="public-casting-grid">{items.map((m,i)=><article key={m.id||i}><div className="public-photo"><img src={m.src} alt={m.talentName||m.name||'Model'}/><span>CHOICE {m.choice||'—'}</span></div><div className="public-copy"><h2>{m.talentName||m.name||'Model'}</h2><p>{m.agency||'Independent'}{m.city?` · ${m.city}`:''}</p><div className="public-measures">{[['Height',m.height],['Bust / chest',m.bust],['Waist',m.waist],['Hips',m.hips],['Shoes',m.shoes],['Availability',m.availability]].filter(x=>x[1]).map(([k,v])=><span key={k}><small>{k}</small><b>{v}</b></span>)}</div>{m.notes&&<p className="public-notes">{m.notes}</p>}</div></article>)}</section><footer>Shared securely from SET · No account required</footer></main>
}
