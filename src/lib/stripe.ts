import { loadStripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string

if (!publishableKey) {
  throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY. Check .env.local.')
}

export const stripePromise = loadStripe(publishableKey)
