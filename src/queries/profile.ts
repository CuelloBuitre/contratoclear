import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { profileKeys } from '@/queries/keys'
import type { Profile } from '@/types'

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data as Profile
    },
    staleTime: 1000 * 60 * 2, // 2 min — credits change after purchases
  })
}

export function useCredits() {
  const { data: profile, ...rest } = useProfile()
  const hasCredits =
    profile?.plan === 'pro' ||
    (profile != null &&
      profile.credits_remaining > 0 &&
      (profile.credits_expiry == null || new Date(profile.credits_expiry) > new Date()))

  return { credits: profile?.credits_remaining ?? 0, hasCredits, ...rest }
}
