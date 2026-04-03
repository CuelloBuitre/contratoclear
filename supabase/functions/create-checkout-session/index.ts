import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-12-18.acacia',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── 1. Verify auth ────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'No authorization header' }, 401)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) return json({ error: 'Unauthorized' }, 401)

    // ── 2. Parse body ─────────────────────────────────────────────────────────
    const { priceId, priceType } = await req.json() as {
      priceId: string
      priceType: 'single' | 'pack' | 'pro'
    }

    if (!priceId || !priceType) {
      return json({ error: 'Missing priceId or priceType' }, 400)
    }

    if (!['single', 'pack', 'pro'].includes(priceType)) {
      return json({ error: 'Invalid priceType' }, 400)
    }

    // ── 3. Determine checkout mode ────────────────────────────────────────────
    const mode = priceType === 'pro' ? 'subscription' : 'payment'

    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173'

    // ── 4. Create Stripe Checkout Session ─────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment/cancel`,
      metadata: {
        user_id: user.id,
        price_type: priceType,
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Locale
      locale: 'es',
    })

    if (!session.url) {
      return json({ error: 'Failed to create checkout session' }, 500)
    }

    return json({ url: session.url })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('create-checkout-session error:', message)
    return json({ error: message }, 500)
  }
})
