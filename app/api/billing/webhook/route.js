import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '../../../../lib/server/stripe.js';
import { createSupabaseAdmin } from '../../../../lib/server/supabase-admin.js';

async function saveEvent(db,event,userId){
  if(!userId) return;
  const object=event.data.object;
  const {error}=await db.from('payment_events').insert({owner_id:userId,provider:'stripe',provider_event_id:event.id,event_type:event.type,amount:object.amount_total?object.amount_total/100:null,currency:(object.currency||'eur').toUpperCase(),payload:event});
  if(error && error.code!=='23505') throw error;
}

async function syncSubscription(db,sub,userId,planCode){
  if(!userId) return;
  const row={
    user_id:userId,
    plan_code:planCode||sub.metadata?.plan_code||'pro_monthly',
    provider:'stripe',
    provider_customer_id:String(sub.customer||''),
    provider_subscription_id:String(sub.id),
    status:sub.status,
    current_period_ends_at:sub.current_period_end?new Date(sub.current_period_end*1000).toISOString():null,
    trial_ends_at:sub.trial_end?new Date(sub.trial_end*1000).toISOString():null,
    last_verified_at:new Date().toISOString()
  };
  const {data:existing,error:findError}=await db.from('subscriptions')
    .select('id')
    .eq('provider','stripe')
    .eq('provider_subscription_id',sub.id)
    .limit(1);
  if(findError) throw findError;
  const existingId=existing?.[0]?.id;
  if(existingId){
    const {error}=await db.from('subscriptions').update(row).eq('id',existingId);
    if(error) throw error;
  }else{
    const {error}=await db.from('subscriptions').insert(row);
    if(error) throw error;
  }
}

export async function POST(req){
  const stripe=getStripe(), raw=await req.text(), h=await headers();
  let event;
  try{
    const secret=(process.env.STRIPE_WEBHOOK_SECRET||'').trim();
    event=stripe.webhooks.constructEvent(raw,h.get('stripe-signature'),secret);
  }catch(e){
    return new NextResponse(`Webhook Error: ${e.message}`,{status:400});
  }
  const db=createSupabaseAdmin();
  const {data:already,error:dupeError}=await db.from('payment_events')
    .select('id')
    .eq('provider','stripe')
    .eq('provider_event_id',event.id)
    .limit(1);
  if(dupeError) return NextResponse.json({error:dupeError.message},{status:500});
  if(already?.length) return NextResponse.json({received:true,duplicate:true});

  const object=event.data.object;
  if(event.type==='checkout.session.completed' && object.mode==='subscription'){
    const userId=object.metadata?.user_id, planCode=object.metadata?.plan_code;
    const sub=await stripe.subscriptions.retrieve(object.subscription);
    await syncSubscription(db,sub,userId,planCode);
    await saveEvent(db,event,userId);
  } else if(['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type)){
    const userId=object.metadata?.user_id;
    await syncSubscription(db,object,userId,object.metadata?.plan_code);
    await saveEvent(db,event,userId);
  }
  return NextResponse.json({received:true});
}
