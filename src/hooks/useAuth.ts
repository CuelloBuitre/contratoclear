import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAppStore'

export function useAuth() {
  const reset = useAuthStore((s) => s.reset)

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    reset()
  }

  return { signIn, signUp, signOut }
}
