import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'

type CategoryKey = 'work' | 'purchase' | 'payslip'
type CardState = 'idle' | 'open' | 'submitting' | 'done'

const CATEGORIES: { key: CategoryKey; icon: string }[] = [
  { key: 'work', icon: '📋' },
  { key: 'purchase', icon: '🏠' },
  { key: 'payslip', icon: '📄' },
]

export default function UpcomingSection() {
  const { t } = useTranslation()

  const [cardStates, setCardStates] = useState<Record<CategoryKey, CardState>>({
    work: 'idle',
    purchase: 'idle',
    payslip: 'idle',
  })
  const [emails, setEmails] = useState<Record<CategoryKey, string>>({
    work: '',
    purchase: '',
    payslip: '',
  })

  function setCardState(key: CategoryKey, state: CardState) {
    setCardStates((prev) => ({ ...prev, [key]: state }))
  }

  function setEmail(key: CategoryKey, value: string) {
    setEmails((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(key: CategoryKey) {
    const email = emails[key].trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return

    setCardState(key, 'submitting')
    try {
      await supabase.from('waitlist').insert({ email, category: key })
      setCardState(key, 'done')
    } catch {
      setCardState(key, 'open')
    }
  }

  return (
    <section className="bg-gray-50 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
            {t('landing.upcoming.overline')}
          </p>
          <h2 className="heading-section text-gray-900">
            {t('landing.upcoming.title')}
          </h2>
          <p className="mt-3 text-base leading-[1.7] text-gray-500">
            {t('landing.upcoming.subtitle')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {CATEGORIES.map(({ key, icon }) => {
            const state = cardStates[key]
            return (
              <div
                key={key}
                className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                {/* Próximamente badge */}
                <span className="absolute right-4 top-4 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                  {t('landing.upcoming.badge')}
                </span>

                {/* Icon */}
                <span className="mb-4 text-3xl leading-none" aria-hidden="true">{icon}</span>

                {/* Title + description */}
                <h3 className="mb-2 pr-20 text-sm font-bold text-gray-900">
                  {t(`landing.upcoming.categories.${key}.title`)}
                </h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-500">
                  {t(`landing.upcoming.categories.${key}.description`)}
                </p>

                {/* Notify flow */}
                {state === 'done' ? (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700">
                    <svg className="h-3.5 w-3.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('landing.upcoming.success')}
                  </div>
                ) : state === 'open' || state === 'submitting' ? (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emails[key]}
                      onChange={(e) => setEmail(key, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(key)}
                      placeholder={t('landing.upcoming.emailPlaceholder')}
                      autoFocus
                      disabled={state === 'submitting'}
                      className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => handleSubmit(key)}
                      disabled={state === 'submitting'}
                      className="rounded-lg bg-[#1a1a2e] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {state === 'submitting' ? (
                        <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        t('landing.upcoming.submitButton')
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCardState(key, 'open')}
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {t('landing.upcoming.notifyButton')}
                  </button>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
