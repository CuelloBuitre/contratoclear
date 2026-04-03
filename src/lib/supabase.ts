import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local.')
}

// Custom fetch interceptor — handles 401s from data/storage APIs.
// Does NOT import the auth store (avoids circular deps with useAppStore → supabase).
// Store cleanup happens via the SIGNED_OUT event that Supabase emits after sign-out.
const interceptedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)

  if (response.status === 401) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    // Skip auth endpoints — Supabase handles token refresh internally
    if (!url.includes('/auth/v1/')) {
      sessionStorage.setItem('auth_flash', 'auth.sessionExpired')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  }

  return response
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: interceptedFetch },
})
