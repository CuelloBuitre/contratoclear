import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { supabase } from '@/lib/supabase'
import { analysisKeys, profileKeys } from '@/queries/keys'
import { analysisResultSchema } from '@/schemas'
import { useUploadStore } from '@/store/useAppStore'
import type { Analysis } from '@/types'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data URL prefix to get raw base64
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function useAnalyzeContract() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setStatus, setError } = useUploadStore()

  return useMutation({
    mutationFn: async (file: File) => {
      if (file.type !== 'application/pdf') {
        throw new Error('invalid_file_type')
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error('file_too_large')
      }

      setStatus('uploading')
      const pdfBase64 = await fileToBase64(file)

      setStatus('analyzing')
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session:', session)
      console.log('Token:', session?.access_token)
      if (!session) throw new Error('unauthorized')

      const token = session.access_token
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/analyze-contract`

      const res = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdfBase64, filename: file.name }),
      })

      if (!res.ok) {
        const { error } = await res.json() as { error: string }
        throw new Error(error)
      }

      const { analysis } = await res.json() as { analysis: Analysis }

      // Validate Claude response shape before trusting it
      analysisResultSchema.parse(analysis.result_json)

      return analysis
    },
    onSuccess: (analysis) => {
      setStatus('done')
      queryClient.invalidateQueries({ queryKey: analysisKeys.list() })
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
      navigate(`/analysis/${analysis.id}`)
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })
}
