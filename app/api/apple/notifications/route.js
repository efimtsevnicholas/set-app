import {NextResponse} from 'next/server';
export async function POST(req){const body=await req.json().catch(()=>null);if(!body?.signedPayload)return NextResponse.json({error:'signedPayload is required'},{status:400});return NextResponse.json({received:true,verification:'required-before-entitlement-change'},{status:202})}
