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

  // ── Verify Stripe signature ───────────────────────────────────────────────
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    console.error('Stripe signature error:', message)
    return new Response(JSON.stringify({ error: message }), { status: 400 })
  }

  // ── Route events ──────────────────────────────────────────────────────────
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
        // Log only — do not remove access yet; Stripe will retry
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed — subscription:', invoice.subscription, 'customer:', invoice.customer)
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
    console.error('Webhook handler error:', message)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// ── Handlers ──────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const priceType = session.metadata?.price_type as 'single' | 'pack' | 'pro' | undefined

  if (!userId) {
    console.error('checkout.session.completed: missing user_id in metadata')
    return
  }
  if (!priceType) {
    console.error('checkout.session.completed: missing price_type in metadata')
    return
  }

  const customerId = session.customer as string | null

  let updateData: Record<string, unknown> = {}

  if (customerId) {
    updateData.stripe_customer_id = customerId
  }

  if (priceType === 'single') {
    updateData = {
      ...updateData,
      plan: 'single',
      credits_remaining: 1,
      credits_expiry: null,
    }
  } else if (priceType === 'pack') {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 90)
    updateData = {
      ...updateData,
      plan: 'pack',
      credits_remaining: 3,
      credits_expiry: expiry.toISOString(),
    }
  } else if (priceType === 'pro') {
    updateData = {
      ...updateData,
      plan: 'pro',
      // Large sentinel value — pro users bypass the credit check entirely
      credits_remaining: 9999,
      credits_expiry: null,
      stripe_subscription_id: session.subscription as string | null,
    }
  } else {
    console.error('Unknown price_type:', priceType)
    return
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updateData)
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  console.log(`Profile updated — user: ${userId}, price_type: ${priceType}`)
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
    throw new Error(`Failed to downgrade profile on subscription deletion: ${error.message}`)
  }

  console.log(`Subscription deleted — subscription: ${subscription.id}`)
}
