import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { analysisKeys } from '@/queries/keys'
import type { Analysis } from '@/types'

export function useAnalyses() {
  return useQuery({
    queryKey: analysisKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Analysis[]
    },
    staleTime: 1000 * 60 * 5, // 5 min
  })
}

export function useAnalysis(id: string) {
  return useQuery({
    queryKey: analysisKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Analysis
    },
    staleTime: 1000 * 60 * 30, // 30 min — analyses don't change
    enabled: !!id,
  })
}
