import { useState } from 'react'
import { useAuthStore, handleSessionExpired } from '@/store/useAppStore'
import { useProfile } from '@/queries/profile'

export interface LegalChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const FREE_LIMIT = 5
const STORAGE_KEY = 'clausulaai_legal_chat_count'
const MAX_HISTORY = 20

function getStoredCount(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v ? Math.max(0, parseInt(v, 10)) : 0
  } catch {
    return 0
  }
}

function incrementStoredCount(): number {
  try {
    const next = getStoredCount() + 1
    localStorage.setItem(STORAGE_KEY, String(next))
    return next
  } catch {
    return FREE_LIMIT
  }
}

export function useLegalChat() {
  const { data: profile } = useProfile()
  const session = useAuthStore((s) => s.session)
  const isPro = profile?.plan === 'pro'

  const [messages, setMessages] = useState<LegalChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [freeCount, setFreeCount] = useState(getStoredCount)

  const isLimitReached = !isPro && freeCount >= FREE_LIMIT
  const questionsLeft = isPro ? Infinity : Math.max(0, FREE_LIMIT - freeCount)

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!session?.access_token || !trimmed || isLoading || isLimitReached) return

    const userMsg: LegalChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    // Build history (without timestamps) trimmed to MAX_HISTORY
    const history = messages
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }))

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const res = await fetch(`${supabaseUrl}/functions/v1/legal-chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmed, conversation_history: history }),
      })

      if (res.status === 401) {
        handleSessionExpired()
        throw new Error('session_expired')
      }

      const data = await res.json() as { response?: string; error?: string }

      if (!res.ok || !data.response) {
        throw new Error(data.error ?? 'Error al conectar')
      }

      const assistantMsg: LegalChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMsg])

      // Increment free-user counter
      if (!isPro) {
        const next = incrementStoredCount()
        setFreeCount(next)
      }

    } catch (err) {
      if (err instanceof Error && err.message === 'session_expired') return
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    error,
    isPro,
    freeCount,
    questionsLeft,
    isLimitReached,
    sendMessage,
  }
}
