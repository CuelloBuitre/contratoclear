import { useState } from 'react'
import { useAuthStore } from '@/store/useAppStore'

// ── Stripe test card numbers (TEST MODE ONLY) ─────────────────────────────────
// Success (any future date, any CVC):    4242 4242 4242 4242
// Generic decline:                       4000 0000 0000 0002
// Requires 3D Secure authentication:     4000 0025 0000 3155
// Insufficient funds:                    4000 0000 0000 9995
// ─────────────────────────────────────────────────────────────────────────────

export type PriceType = 'single' | 'pack' | 'pro'

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const session = useAuthStore((s) => s.session)

  async function checkout(priceId: string, priceType: PriceType) {
    if (!session?.access_token) {
      setError('Debes iniciar sesión para continuar.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const res = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, priceType }),
      })

      const data = await res.json() as { url?: string; error?: string }

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? 'No se pudo iniciar el pago. Inténtalo de nuevo.')
      }

      // Redirect to Stripe Checkout — full page navigation, no return value needed
      window.location.href = data.url

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado. Inténtalo de nuevo.'
      setError(message)
      setIsLoading(false)
    }
    // Note: setIsLoading(false) is intentionally NOT called on success because
    // the page navigates away to Stripe. The loading state stays true until redirect.
  }

  return { checkout, isLoading, error }
}
