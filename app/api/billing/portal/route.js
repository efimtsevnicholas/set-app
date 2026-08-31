import { NextResponse } from 'next/server';
import { requireUser } from '../../../../lib/server/auth.js';
import { getStripe } from '../../../../lib/server/stripe.js';
import { createSupabaseAdmin } from '../../../../lib/server/supabase-admin.js';
import { getCurrentStripeSubscription } from '../../../../lib/server/subscriptions.js';

export async function POST(){
  try{
    const user=await requireUser();
    const db=createSupabaseAdmin();
    const {subscription}=await getCurrentStripeSubscription(db,user.id);
    if(!subscription?.provider_customer_id) return NextResponse.json({error:'No Stripe customer found'},{status:404});
    const session=await getStripe().billingPortal.sessions.create({
      customer:subscription.provider_customer_id,
      return_url:`${process.env.NEXT_PUBLIC_APP_URL}/?billing=portal`
    });
    return NextResponse.json({url:session.url});
  }catch(e){
    return NextResponse.json({error:e.message},{status:e.message==='UNAUTHORIZED'?401:500});
  }
}
