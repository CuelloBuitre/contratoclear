import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useLegalChat, type LegalChatMessage } from '@/hooks/useLegalChat'

// ── Article badge extractor ───────────────────────────────────────────────────

function extractArticles(text: string): string[] {
  const matches = [...text.matchAll(/[Aa]rt(?:ículo)?\.?\s*(\d+(?:\.\d+)?(?:\s*[a-zA-Z])?)\s*(?:LAU|CE)?/g)]
  const seen = new Set<string>()
  const result: string[] = []
  for (const m of matches) {
    const key = `Art. ${m[1].trim()} LAU`
    if (!seen.has(key)) {
      seen.add(key)
      result.push(key)
    }
  }
  return result
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ScalesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 6l9-3 9 3M3 6v14l9 3 9-3V6M12 3v18M8 9l-2 4h4L8 9zm8 0l-2 4h4l-2-4z" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[#b0a898]"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}

// ── Single message ────────────────────────────────────────────────────────────

function ChatMessage({ msg }: { msg: LegalChatMessage }) {
  const { t } = useTranslation()
  const isUser = msg.role === 'user'
  const articles = isUser ? [] : extractArticles(msg.content)

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0f0f1a] px-4 py-3">
          <p className="text-sm leading-relaxed text-white">{msg.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#0f0f1a]">
        <ScalesIcon className="h-3.5 w-3.5 text-[#c9a96e]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-xs font-medium text-[#6b6860]">{t('legalChat.aiLabel')}</p>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-[#e8e4dd] bg-white px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#0f0f1a]">{msg.content}</p>
        </div>
        {articles.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {articles.map((a) => (
              <span
                key={a}
                className="inline-flex items-center rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0f0f1a]"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Suggested questions ───────────────────────────────────────────────────────

const SUGGESTED_KEYS = [
  'legalChat.suggested.q1',
  'legalChat.suggested.q2',
  'legalChat.suggested.q3',
  'legalChat.suggested.q4',
  'legalChat.suggested.q5',
  'legalChat.suggested.q6',
  'legalChat.suggested.q7',
  'legalChat.suggested.q8',
] as const

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LegalChat() {
  const { t } = useTranslation()
  const {
    messages,
    isLoading,
    error,
    isPro,
    questionsLeft,
    isLimitReached,
    sendMessage,
  } = useLegalChat()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const MAX_CHARS = 500

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px` // max 3 rows ≈ 96px
  }, [input])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || isLimitReached || input.length > MAX_CHARS) return
    const text = input
    setInput('')
    await sendMessage(text)
  }, [input, isLoading, isLimitReached, sendMessage])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSuggestion(text: string) {
    setInput(text)
    textareaRef.current?.focus()
  }

  const charOverLimit = input.length > MAX_CHARS

  return (
    <div className="flex flex-1 flex-col" style={{ minHeight: 0 }}>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="border-b border-[#e8e4dd] bg-white px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
            {t('legalChat.overline')}
          </p>
          <h1 className="font-display text-xl font-bold text-[#0f0f1a] sm:text-2xl">
            {t('legalChat.title')}
          </h1>
          <p className="mt-1 text-sm text-[#6b6860]">{t('legalChat.subtitle')}</p>
        </div>
      </div>

      {/* ── Disclaimer banner ──────────────────────────────────────────────── */}
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-6">
        <div className="mx-auto max-w-3xl flex items-start gap-2">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs leading-relaxed text-amber-800">{t('legalChat.disclaimer')}</p>
        </div>
      </div>

      {/* ── Messages area ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">

          {/* Empty state — suggested questions */}
          {messages.length === 0 && !isLoading && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f0f1a]">
                  <ScalesIcon className="h-7 w-7 text-[#c9a96e]" />
                </div>
                <p className="text-sm font-semibold text-[#0f0f1a]">{t('legalChat.emptyTitle')}</p>
                <p className="mt-1 text-sm text-[#6b6860]">{t('legalChat.emptySubtitle')}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTED_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSuggestion(t(key))}
                    className="rounded-full border border-[#e8e4dd] bg-white px-4 py-2 text-sm text-[#0f0f1a] transition-colors hover:border-[#c9a96e] hover:bg-[#c9a96e]/5"
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} msg={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#0f0f1a]">
                  <ScalesIcon className="h-3.5 w-3.5 text-[#c9a96e]" />
                </div>
                <div className="rounded-2xl rounded-tl-sm border border-[#e8e4dd] bg-white">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {t('legalChat.error')}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Limit reached */}
          {isLimitReached && (
            <div className="mt-6 rounded-xl border border-[#c9a96e]/30 bg-[#c9a96e]/5 p-6 text-center">
              <p className="mb-1 text-sm font-semibold text-[#0f0f1a]">{t('legalChat.limitTitle')}</p>
              <p className="mb-4 text-sm text-[#6b6860]">{t('legalChat.limitSub')}</p>
              <Link
                to="/pricing"
                className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-[#0f0f1a] transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)' }}
              >
                {t('legalChat.limitCta')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Input area ─────────────────────────────────────────────────────── */}
      {!isLimitReached && (
        <div className="border-t border-[#e8e4dd] bg-white px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('legalChat.placeholder')}
                rows={1}
                className="flex-1 resize-none rounded-xl border border-[#e8e4dd] bg-[#fafaf8] px-4 py-3 text-sm text-[#0f0f1a] placeholder-[#b0a898] outline-none transition-colors focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
                style={{ overflow: 'hidden' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || charOverLimit}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[#0f0f1a] transition-all hover:opacity-90 hover:-translate-y-px disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)' }}
                aria-label={t('legalChat.send')}
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Counters row */}
            <div className="mt-2 flex items-center justify-between">
              <p className={`text-xs ${charOverLimit ? 'text-red-500' : 'text-[#b0a898]'}`}>
                {input.length}/{MAX_CHARS}
              </p>
              <p className="text-xs text-[#b0a898]">
                {isPro
                  ? t('legalChat.unlimited')
                  : t('legalChat.questionsLeft', { count: questionsLeft })}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
