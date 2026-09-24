import { NextResponse } from 'next/server';
import { requireUser } from '../../../../lib/server/auth.js';
import { createSupabaseAdmin } from '../../../../lib/server/supabase-admin.js';
import { hasProAccess } from '../../../../lib/billing.js';
import { getCurrentStripeSubscription } from '../../../../lib/server/subscriptions.js';
import { accountTrial } from '../../../../lib/server/access.js';

export async function GET(){
  try{
    const user=await requireUser();
    const db=createSupabaseAdmin();
    const {subscription:data,rows}=await getCurrentStripeSubscription(db,user.id);const trial=accountTrial(user);let paymentMethod=null;if(data?.provider_customer_id){try{const {getStripe}=await import('../../../../lib/server/stripe.js');const customer=await getStripe().customers.retrieve(data.provider_customer_id,{expand:['invoice_settings.default_payment_method']});if(customer&&!customer.deleted){const pm=customer.invoice_settings?.default_payment_method;if(pm&&typeof pm==='object'&&pm.card)paymentMethod={brand:pm.card.brand,last4:pm.card.last4,expMonth:pm.card.exp_month,expYear:pm.card.exp_year};}}catch{}}
    return NextResponse.json({
      hasCustomer:Boolean(data?.provider_customer_id),
      hasAccess:hasProAccess(data)||trial.active,
      accountTrialActive:trial.active,
      accountTrialEndsAt:trial.endsAt,
      status:data?.status||null,
      planCode:data?.plan_code||null,
      currentPeriodEndsAt:data?.current_period_ends_at||null,
      trialEndsAt:data?.trial_ends_at||null,
      cancelAtPeriodEnd:Boolean(data?.cancel_at_period_end),
      provider:data?.provider||'stripe',
      duplicateCount:Math.max(0,rows.length-1),
      paymentMethod,
    });
  }catch(e){
    return NextResponse.json({error:e.message==='UNAUTHORIZED'?'Unauthorized':e.message},{status:e.message==='UNAUTHORIZED'?401:500});
  }
}
