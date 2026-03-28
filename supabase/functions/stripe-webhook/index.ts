import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-12-18.acacia',
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return new Response(JSON.stringify({ error: message }), { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      case 'invoice.payment_failed': {
        // Optionally notify user — for now just log
        console.log('Payment failed for subscription:', event.data.object)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook handler error'
    console.error('Webhook error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  if (!userId) {
    console.error('No user_id in session metadata')
    return
  }

  const priceId = session.metadata?.price_id
  const singlePriceId = Deno.env.get('STRIPE_PRICE_SINGLE')
  const packPriceId = Deno.env.get('STRIPE_PRICE_PACK')
  const proPriceId = Deno.env.get('STRIPE_PRICE_PRO')

  let updateData: Record<string, unknown> = {
    stripe_customer_id: session.customer as string,
  }

  if (priceId === singlePriceId) {
    updateData = {
      ...updateData,
      plan: 'single',
      credits_remaining: 1,
      credits_expiry: null,
    }
  } else if (priceId === packPriceId) {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 90)
    updateData = {
      ...updateData,
      plan: 'pack',
      credits_remaining: 3,
      credits_expiry: expiry.toISOString(),
    }
  } else if (priceId === proPriceId) {
    updateData = {
      ...updateData,
      plan: 'pro',
      credits_remaining: 0,
      credits_expiry: null,
      stripe_subscription_id: session.subscription as string,
    }
  } else {
    console.error('Unknown price ID:', priceId)
    return
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      plan: 'none',
      credits_remaining: 0,
      stripe_subscription_id: null,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    throw new Error(`Failed to downgrade profile: ${error.message}`)
  }
}
