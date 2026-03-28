import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

// ── Lucide-style inline SVG icons ─────────────────────────────────────────────

function IconFileText({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconBookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

function IconAlertTriangle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconCheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// ── Step icons ────────────────────────────────────────────────────────────────

const STEP_ICONS = [IconFileText, IconSearch, IconBookOpen, IconAlertTriangle, IconCheckCircle]
const STEP_DELAYS = [0, 3000, 6000, 9000, 12000]

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalysisLoader() {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(0)

  const stepLabels = [
    t('loader.step1'),
    t('loader.step2'),
    t('loader.step3'),
    t('loader.step4'),
    t('loader.step5'),
  ]

  useEffect(() => {
    const timers = STEP_DELAYS.slice(1).map((delay, i) =>
      setTimeout(() => setActiveStep(i + 1), delay),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center px-4 py-10">

      {/* ── Animated document ──────────────────────────────────────────── */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute h-28 w-24 rounded-2xl bg-indigo-100 blur-xl opacity-60" />

        {/* Document card */}
        <div className="relative h-28 w-24 overflow-hidden rounded-xl border-2 border-[#1a1a2e]/10 bg-white shadow-lg">
          {/* Document lines */}
          <div className="absolute inset-0 flex flex-col justify-center gap-2 px-4 py-5">
            <div className="h-1.5 w-full rounded-full bg-gray-200" />
            <div className="h-1.5 w-4/5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-full rounded-full bg-gray-200" />
            <div className="h-1.5 w-3/5 rounded-full bg-gray-200" />
            <div className="h-1.5 w-full rounded-full bg-gray-200" />
            <div className="h-1.5 w-4/5 rounded-full bg-gray-200" />
          </div>

          {/* Scan beam */}
          <div
            className="absolute left-0 right-0 h-10 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.25), rgba(99,102,241,0.15), transparent)',
              animation: 'scan-beam 2.2s ease-in-out infinite',
            }}
          />

          {/* Corner fold */}
          <div className="absolute right-0 top-0 h-0 w-0"
            style={{ borderLeft: '10px solid #e5e7eb', borderBottom: '10px solid transparent', borderTop: '10px solid transparent' }}
          />
        </div>

        {/* Floating badge */}
        <div className="absolute -bottom-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-indigo-600 shadow-md">
          <svg className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────── */}
      <div className="mb-8 w-full">
        <div className="mb-1.5 flex justify-between text-xs text-gray-400">
          <span>{t('loader.analyzing')}</span>
          <span>{t('loader.estimatedTime')}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#1a1a2e]"
            style={{ animation: 'progress-fill 13s linear forwards' }}
          />
        </div>
      </div>

      {/* ── Step list ──────────────────────────────────────────────────── */}
      <div className="w-full space-y-3">
        {stepLabels.map((label, i) => {
          const StepIcon = STEP_ICONS[i]
          const isCompleted = i < activeStep
          const isActive = i === activeStep
          const isInactive = i > activeStep

          return (
            <div
              key={i}
              className={[
                'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-500',
                isActive ? 'bg-[#1a1a2e] shadow-md' : '',
                isCompleted ? 'bg-green-50' : '',
                isInactive ? 'bg-gray-50' : '',
              ].join(' ')}
            >
              {/* Icon container */}
              <div
                className={[
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-500',
                  isActive ? 'bg-white/15' : '',
                  isCompleted ? 'bg-green-100' : '',
                  isInactive ? 'bg-gray-100' : '',
                ].join(' ')}
              >
                {isCompleted ? (
                  <IconCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <StepIcon
                    className={[
                      'h-4 w-4 transition-colors duration-500',
                      isActive ? 'text-white' : '',
                      isInactive ? 'text-gray-300' : '',
                    ].join(' ')}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={[
                  'text-sm font-medium transition-colors duration-500',
                  isActive ? 'text-white' : '',
                  isCompleted ? 'text-green-700' : '',
                  isInactive ? 'text-gray-300' : '',
                ].join(' ')}
              >
                {label}
              </span>

              {/* Active pulse dot */}
              {isActive && (
                <div className="ml-auto flex shrink-0 items-center gap-1">
                  {[0, 1, 2].map((dot) => (
                    <div
                      key={dot}
                      className="h-1 w-1 rounded-full bg-white/70"
                      style={{
                        animation: 'step-pulse 1.2s ease-in-out infinite',
                        animationDelay: `${dot * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Completed label */}
              {isCompleted && (
                <span className="ml-auto text-xs font-medium text-green-500">✓</span>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Footer note ────────────────────────────────────────────────── */}
      <p className="mt-8 text-center text-xs text-gray-400">
        {t('loader.note')}
      </p>
    </div>
  )
}
