import { NextResponse } from 'next/server';
import { requireUser } from '../../../../lib/server/auth.js';
import { createSupabaseAdmin } from '../../../../lib/server/supabase-admin.js';
import { hasProAccess } from '../../../../lib/billing.js';
import { getCurrentStripeSubscription } from '../../../../lib/server/subscriptions.js';

export async function GET(){
  try{
    const user=await requireUser();
    const db=createSupabaseAdmin();
    const {subscription:data,rows}=await getCurrentStripeSubscription(db,user.id);
    return NextResponse.json({
      hasCustomer:Boolean(data?.provider_customer_id),
      hasAccess:hasProAccess(data),
      status:data?.status||null,
      planCode:data?.plan_code||null,
      currentPeriodEndsAt:data?.current_period_ends_at||null,
      trialEndsAt:data?.trial_ends_at||null,
      duplicateCount:Math.max(0,rows.length-1),
    });
  }catch(e){
    return NextResponse.json({error:e.message==='UNAUTHORIZED'?'Unauthorized':e.message},{status:e.message==='UNAUTHORIZED'?401:500});
  }
}
