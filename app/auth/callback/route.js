import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function GET(request){
 const {searchParams,origin}=new URL(request.url); const code=searchParams.get('code');
 if(code){
  const response=NextResponse.redirect(`${origin}/`);
  const supabase=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll(){return request.cookies.getAll()},setAll(cookies){cookies.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
  await supabase.auth.exchangeCodeForSession(code); return response;
 }
 return NextResponse.redirect(`${origin}/login`);
}
