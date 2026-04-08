import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { contractKeys } from '@/queries/keys'
import { useAuthStore } from '@/store/useAppStore'
import type { Contract } from '@/types'

export function useContracts() {
  const user = useAuthStore((s) => s.user)
  return useQuery({
    queryKey: contractKeys.list(),
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('contract_end', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as Contract[]
    },
    staleTime: 1000 * 60 * 5, // 5 min
  })
}

export type ContractInput = Omit<Contract, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export function useAddContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ContractInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('contracts')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data as Contract
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.list() })
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ContractInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('contracts')
        .update(input)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Contract
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.list() })
    },
  })
}

export function useDeleteContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.list() })
    },
  })
}
