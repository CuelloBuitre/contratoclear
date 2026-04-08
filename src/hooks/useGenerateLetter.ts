import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { handleSessionExpired } from '@/store/useAppStore'

export type LetterType =
  | 'impago'
  | 'actualizacion_renta'
  | 'preaviso_no_renovacion'
  | 'devolucion_fianza'

export interface LetterResult {
  letter_text: string
  letter_type: LetterType
  generated_at: string
}

interface GenerateLetterInput {
  letter_type: LetterType
  contract_data: Record<string, string>
}

export function useGenerateLetter() {
  return useMutation({
    mutationFn: async ({ letter_type, contract_data }: GenerateLetterInput): Promise<LetterResult> => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('unauthorized')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-letter`

      const res = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ letter_type, contract_data }),
      })

      if (res.status === 401) {
        handleSessionExpired()
        throw new Error('session_expired')
      }

      if (res.status === 403) throw new Error('pro_required')

      if (!res.ok) {
        const { error } = await res.json() as { error: string }
        throw new Error(error)
      }

      return res.json() as Promise<LetterResult>
    },
  })
}
