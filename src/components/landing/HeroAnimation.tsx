import { useTranslation } from 'react-i18next'

// ── Inline SVG icons (lucide style) ──────────────────────────────────────────

function IconFile() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function IconSearch() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      viewBox="0 0 24 24" className="h-4 w-4">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconScale() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      viewBox="0 0 24 24" className="h-4 w-4">
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M17 21H7" />
      <path d="M3 6l9-3 9 3" />
      <path d="M6 6l-3 9a5.002 5.002 0 0 0 6 0L6 6z" />
      <path d="M18 6l-3 9a5.002 5.002 0 0 0 6 0L18 6z" />
    </svg>
  )
}

function IconAlert() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      viewBox="0 0 24 24" className="h-4 w-4">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

// ── Animation duration ────────────────────────────────────────────────────────
const DUR = '20s'

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroAnimation() {
  const { t } = useTranslation()

  const stepIcons = [<IconFile />, <IconSearch />, <IconScale />, <IconAlert />, <IconCheck />]
  const stepKeys = ['loader.step1', 'loader.step2', 'loader.step3', 'loader.step4', 'loader.step5'] as const
  const stepAnims = ['hero-s1', 'hero-s2', 'hero-s3', 'hero-s4', 'hero-s5'] as const

  return (
    <div
      className="hero-animation relative mx-auto w-full"
      style={{ maxWidth: 380, height: 340 }}
      aria-hidden="true"
    >
      {/* ── Phase 1: PDF upload card ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: `hero-p1 ${DUR} ease-in-out infinite`, opacity: 0 }}
      >
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
          {/* File card */}
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">{t('heroAnim.filename')}</p>
              <p className="text-xs text-gray-400">{t('heroAnim.fileSize')}</p>
            </div>
          </div>

          {/* Analyze button */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] px-4 py-3">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-semibold text-white">Analizar contrato</span>
          </div>

          {/* Trust note */}
          <p className="mt-3 text-center text-xs text-gray-400">LAU actualizada a marzo 2026</p>
        </div>
      </div>

      {/* ── Phase 2: Loading / analysis ───────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: `hero-p2 ${DUR} ease-in-out infinite`, opacity: 0 }}
      >
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
          {/* Header */}
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
            <p className="text-sm font-semibold text-gray-700">{t('heroAnim.analyzing')}</p>
          </div>

          {/* Progress bar */}
          <div className="mb-4 overflow-hidden rounded-full bg-gray-100" style={{ height: 6 }}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#1a1a2e]"
              style={{ animation: `hero-bar ${DUR} linear infinite`, width: 0 }}
            />
          </div>

          {/* Step rows */}
          <div className="space-y-2">
            {stepIcons.map((icon, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all"
                style={{
                  animation: `${stepAnims[i]} ${DUR} ease-in-out infinite`,
                  backgroundColor: '#f9fafb',
                  color: '#9ca3af',
                }}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  {icon}
                </div>
                <span className="text-xs font-medium">{t(stepKeys[i])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Phase 3: Results ──────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: `hero-p3 ${DUR} ease-in-out infinite`, opacity: 0 }}
      >
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
          {/* Score badge */}
          <div style={{ animation: `hero-score ${DUR} ease-in-out infinite`, opacity: 0 }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                {t('heroAnim.score')}
              </span>
              <span className="text-xs text-gray-400">3 ilegales · 1 correcto</span>
            </div>
          </div>

          {/* Clause rows */}
          {[
            { labelKey: 'heroAnim.clause1', status: 'ilegal',  statusLabel: 'Ilegal',   pillClass: 'bg-red-100 text-red-700 border-red-200',   anim: 'hero-c1' },
            { labelKey: 'heroAnim.clause2', status: 'ilegal',  statusLabel: 'Ilegal',   pillClass: 'bg-red-100 text-red-700 border-red-200',   anim: 'hero-c2' },
            { labelKey: 'heroAnim.clause3', status: 'ilegal',  statusLabel: 'Ilegal',   pillClass: 'bg-red-100 text-red-700 border-red-200',   anim: 'hero-c3' },
            { labelKey: 'heroAnim.clause4', status: 'ok',      statusLabel: 'Correcto', pillClass: 'bg-green-100 text-green-700 border-green-200', anim: 'hero-c4' },
          ].map((clause, i) => (
            <div
              key={i}
              className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
              style={{ animation: `${clause.anim} ${DUR} ease-in-out infinite`, opacity: 0 }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${clause.status === 'ilegal' ? 'bg-red-400' : 'bg-green-400'}`} />
                <span className="truncate text-xs font-medium text-gray-700">{t(clause.labelKey as Parameters<typeof t>[0])}</span>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${clause.pillClass}`}>
                {clause.statusLabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
