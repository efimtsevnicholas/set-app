import { NextResponse } from 'next/server';
import { requireUser } from '../../../../lib/server/auth.js';
import { getStripe, priceIdForPlan } from '../../../../lib/server/stripe.js';
import { createSupabaseAdmin } from '../../../../lib/server/supabase-admin.js';
import { hasProAccess } from '../../../../lib/billing.js';
import { getCurrentStripeSubscription } from '../../../../lib/server/subscriptions.js';

export async function POST(req){
  try{
    const user=await requireUser();
    const {planCode}=await req.json();
    if(!['pro_monthly','pro_yearly'].includes(planCode)) return NextResponse.json({error:'Invalid plan'}, {status:400});
    const stripe=getStripe(), db=createSupabaseAdmin();
    const {subscription:existing}=await getCurrentStripeSubscription(db,user.id);
    if(hasProAccess(existing)){
      return NextResponse.json({error:'Subscription already active',code:'ALREADY_SUBSCRIBED'},{status:409});
    }
    const minuteBucket=Math.floor(Date.now()/60000);
    const session=await stripe.checkout.sessions.create({
      mode:'subscription',
      customer:existing?.provider_customer_id||undefined,
      customer_email:existing?.provider_customer_id?undefined:user.email,
      line_items:[{price:priceIdForPlan(planCode),quantity:1}],
      subscription_data:{trial_period_days:7,metadata:{user_id:user.id,plan_code:planCode}},
      success_url:`${process.env.NEXT_PUBLIC_APP_URL}/?billing=success`,
      cancel_url:`${process.env.NEXT_PUBLIC_APP_URL}/?billing=cancelled`,
      metadata:{user_id:user.id,plan_code:planCode}
    }, { idempotencyKey:`set-checkout:${user.id}:${planCode}:${minuteBucket}` });
    return NextResponse.json({url:session.url});
  }catch(e){
    return NextResponse.json({error:e.message==='UNAUTHORIZED'?'Unauthorized':e.message},{status:e.message==='UNAUTHORIZED'?401:500});
  }
}
