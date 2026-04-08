import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { organizationKeys } from '@/queries/keys'
import { useAuthStore } from '@/store/useAppStore'
import type { Organization } from '@/types'

export function useOrganization() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: organizationKeys.detail(),
    enabled: !!user,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
      if (error) throw error
      return data as Organization | null
    },
    staleTime: 1000 * 60 * 10, // 10 min — branding rarely changes
  })
}

export type OrganizationInput = Pick<Organization, 'name' | 'logo_url' | 'primary_color' | 'contact_email'>

export function useUpsertOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: OrganizationInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('organizations')
        .upsert({ ...input, id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Organization
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail() })
    },
  })
}
