import {NextResponse} from 'next/server';
import {requireProUser} from '../../../../../lib/server/access.js';
export async function POST(){
 try{await requireProUser(); const clientId=process.env.MICROSOFT_CALENDAR_CLIENT_ID; const appUrl=process.env.NEXT_PUBLIC_APP_URL; if(!clientId||!appUrl)return NextResponse.json({error:'Microsoft Calendar credentials are not configured'},{status:503});
 const redirect=`${appUrl}/api/calendar/callback/microsoft`; const scope=encodeURIComponent('openid profile offline_access Calendars.ReadWrite');
 const url=`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&response_mode=query&scope=${scope}`;
 return NextResponse.json({url});}catch(e){return NextResponse.json({error:e.message==='UNAUTHORIZED'?'Unauthorized':e.message},{status:e.message==='UNAUTHORIZED'?401:500})}
}
