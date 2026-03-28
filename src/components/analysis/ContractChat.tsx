import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useContractChat } from '@/hooks/useContractChat'
import type { AnalysisResult } from '@/types'

// ── Icons ─────────────────────────────────────────────────────────────────────

function MessageCircleIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function RobotIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}

// ── Typing animation ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-gray-400"
          style={{ animation: `step-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}

// ── Format time ───────────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ContractChatProps {
  analysisId: string
  result: AnalysisResult
}

export default function ContractChat({ analysisId }: ContractChatProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, isLoading, error, limitReached, sendMessage } = useContractChat()

  const suggestedQuestions = t('chat.suggestedQuestions', { returnObjects: true }) as string[]

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, isLoading])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || isLoading || limitReached) return
    setInput('')
    await sendMessage(analysisId, msg)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <MessageCircleIcon />
          </span>
          <span className="text-sm font-semibold text-gray-900">{t('chat.title')}</span>
          <span className="rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white">
            {t('chat.badge')}
          </span>
        </div>
        <ChevronIcon open={open} />
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="border-t border-gray-100">
          {/* Message list */}
          <div className="max-h-[350px] overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 text-center mb-3">{t('chat.disclaimer')}</p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(q)}
                    disabled={limitReached}
                    className="block w-full rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-left text-sm text-indigo-700 transition-colors hover:border-indigo-200 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 mb-4">
                    <RobotIcon />
                  </div>
                )}
                <div className={`flex max-w-[80%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={[
                      'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-[#1a1a2e] text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm',
                    ].join(' ')}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                  <RobotIcon />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-3.5 py-2.5">
                  <TypingDots />
                </div>
              </div>
            )}

            {error && !isLoading && (
              <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                {t('chat.error')}
                <button
                  type="button"
                  onClick={() => handleSend(messages[messages.length - 1]?.content)}
                  className="ml-2 font-semibold underline hover:no-underline"
                >
                  Reintentar
                </button>
              </div>
            )}

            {limitReached && (
              <div className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-center text-sm text-amber-700">
                {t('chat.limitReached')}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || limitReached}
                placeholder={limitReached ? t('chat.limitReached') : t('chat.placeholder')}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-300 focus:bg-white disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading || limitReached}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a1a2e] text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
