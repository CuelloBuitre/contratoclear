import { useState } from 'react'
import { useAuthStore } from '@/store/useAppStore'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const MAX_MESSAGES = 10

export function useContractChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const session = useAuthStore((s) => s.session)

  const limitReached = messages.length >= MAX_MESSAGES

  async function sendMessage(analysisId: string, message: string) {
    if (!session?.access_token || !message.trim() || limitReached) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Build conversation history without timestamps for API
    const history = messages.map(({ role, content }) => ({ role, content }))

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const res = await fetch(`${supabaseUrl}/functions/v1/contract-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_id: analysisId,
          message: message.trim(),
          conversation_history: history,
        }),
      })

      const data = await res.json() as { response?: string; error?: string }

      if (!res.ok || !data.response) {
        if (res.status === 429) {
          // Limit reached on server — treat as limit reached
          setMessages((prev) => prev.slice(0, MAX_MESSAGES))
        }
        throw new Error(data.error ?? 'Error al conectar')
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      // Remove the user message that failed
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return { messages, isLoading, error, limitReached, sendMessage }
}
