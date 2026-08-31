import {NextResponse} from 'next/server';
import {requireProUser} from '../../../../../lib/server/access.js';
export async function POST(){
 try{await requireProUser(); if(!process.env.SETMORE_ACCESS_TOKEN)return NextResponse.json({error:'Setmore API access is not configured'},{status:503}); return NextResponse.json({connected:true});}
 catch(e){return NextResponse.json({error:e.message==='UNAUTHORIZED'?'Unauthorized':e.message},{status:e.message==='UNAUTHORIZED'?401:500})}
}
