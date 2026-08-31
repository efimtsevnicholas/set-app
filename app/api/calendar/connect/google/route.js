import {NextResponse} from 'next/server';
import {requireProUser} from '../../../../../lib/server/access.js';
export async function POST(){
 try{await requireProUser(); const clientId=process.env.GOOGLE_CALENDAR_CLIENT_ID; const appUrl=process.env.NEXT_PUBLIC_APP_URL; if(!clientId||!appUrl)return NextResponse.json({error:'Google Calendar credentials are not configured'},{status:503});
 const redirect=`${appUrl}/api/calendar/callback/google`; const scope=encodeURIComponent('openid email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events');
 const url=`https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&access_type=offline&prompt=consent&scope=${scope}`;
 return NextResponse.json({url});}catch(e){return NextResponse.json({error:e.message==='UNAUTHORIZED'?'Unauthorized':e.message},{status:e.message==='UNAUTHORIZED'?401:500})}
}
