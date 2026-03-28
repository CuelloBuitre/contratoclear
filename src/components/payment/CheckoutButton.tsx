// TODO: implement CheckoutButton component
// Requirements from CLAUDE.md:
// - Triggers Stripe Checkout session
// - Passes user_id + price_id in session metadata (for webhook to identify user)
// - Redirects to VITE_APP_URL/payment/success?session_id=xxx on success
// - Disabled while loading
// - Uses stripePromise from @/lib/stripe

interface CheckoutButtonProps {
  priceId: string
  label: string
}

export default function CheckoutButton(_props: CheckoutButtonProps) {
  return null
}
