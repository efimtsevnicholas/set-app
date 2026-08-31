import {NextResponse} from 'next/server';
import {requireProUser} from '../../../../lib/server/access.js';
export async function POST(req){
 try{await requireProUser(); const body=await req.json().catch(()=>({})); const provider=body.provider; const configured={google:Boolean(process.env.GOOGLE_CALENDAR_CLIENT_ID&&process.env.GOOGLE_CALENDAR_CLIENT_SECRET),microsoft:Boolean(process.env.MICROSOFT_CALENDAR_CLIENT_ID&&process.env.MICROSOFT_CALENDAR_CLIENT_SECRET),setmore:Boolean(process.env.SETMORE_ACCESS_TOKEN)}; if(!provider||!configured[provider])return NextResponse.json({error:'Provider is not connected'},{status:503}); return NextResponse.json({ok:true,provider,status:'ready_for_oauth_token_sync'});}
 catch(e){return NextResponse.json({error:e.message==='UNAUTHORIZED'?'Unauthorized':e.message},{status:e.message==='UNAUTHORIZED'?401:500})}
}
