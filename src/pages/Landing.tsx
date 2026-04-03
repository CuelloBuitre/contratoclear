import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DemoSection from '@/components/landing/DemoSection'

const DEFAULT_RENT = 950
const MIN_RENT = 400
const MAX_RENT = 3000
const STEP = 25
const PRICE = 3.99

function fmt(n: number): string {
  return n.toLocaleString('es-ES')
}

function useAnimatedNumber(target: number) {
  const [displayed, setDisplayed] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    const from = prevRef.current
    prevRef.current = target
    if (from === target) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setDisplayed(target)
      return
    }

    const controls = animate(from, target, {
      duration: 0.45,
      ease: 'easeOut',
      onUpdate: (v: number) => setDisplayed(Math.round(v)),
    })
    return () => controls.stop()
  }, [target])

  return displayed
}

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    titleKey: 'landing.features.items.0' as const,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    titleKey: 'landing.features.items.1' as const,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    titleKey: 'landing.features.items.2' as const,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    titleKey: 'landing.features.items.3' as const,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    titleKey: 'landing.features.items.4' as const,
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    titleKey: 'landing.features.items.5' as const,
  },
]

const HOW_IT_WORKS_ICONS = [
  <svg key="upload" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>,
  <svg key="ai" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>,
  <svg key="report" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>,
]

export default function Landing() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const statsRef = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-40px' })

  const [rent, setRent] = useState(DEFAULT_RENT)
  const perYear = rent * 12
  const fiveYears = rent * 60
  const sevenYears = rent * 84
  const pct = ((PRICE / fiveYears) * 100).toFixed(4)
  const fillPct = ((rent - MIN_RENT) / (MAX_RENT - MIN_RENT)) * 100
  const displayedFiveYears = useAnimatedNumber(fiveYears)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1a1a2e] pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
        {/* Subtle grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-[1100px] px-4 sm:px-6">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-6 text-center"
          >
            {/* 1. Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/15 px-4 py-1.5 text-sm font-medium text-green-400">
              {t('landing.hero.badge')}
            </div>

            {/* 2. Headline */}
            <h1
              className="heading-display max-w-3xl text-white"
            >
              {t('landing.hero.headline')}
            </h1>

            {/* 3. Subtitle */}
            <p className="max-w-xl text-base leading-[1.7] text-white/60 sm:text-lg">
              {t('landing.hero.subtitle')}
            </p>

            {/* 4. Calculator — visual centerpiece */}
            <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
              {/* Slider label + value */}
              <p className="mb-2 text-sm font-medium text-white/50">
                {t('landing.hero.sliderLabel')}
              </p>
              <p className="mb-4 text-4xl font-bold tabular-nums text-white">
                {fmt(rent)}<span className="ml-1 text-lg font-normal text-white/50">€/mes</span>
              </p>

              {/* Slider */}
              <div className="px-1">
                <input
                  type="range"
                  min={MIN_RENT}
                  max={MAX_RENT}
                  step={STEP}
                  value={rent}
                  onChange={(e) => setRent(Number(e.target.value))}
                  className="rent-slider w-full"
                  style={{
                    background: `linear-gradient(to right, rgba(255,255,255,0.85) ${fillPct}%, rgba(255,255,255,0.15) ${fillPct}%)`,
                  }}
                />
                <div className="mt-2 flex justify-between text-xs text-white/30">
                  <span>{fmt(MIN_RENT)}€</span>
                  <span>{fmt(MAX_RENT)}€</span>
                </div>
              </div>

              {/* 3 stats */}
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs font-medium text-white/50">{t('landing.hero.perYear')}</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-white">{fmt(perYear)}€</p>
                </div>
                <div className="border-x border-white/10 px-2">
                  <p className="text-xs font-medium text-white/50">{t('landing.hero.fiveYears')}</p>
                  <p
                    className="mt-1 text-3xl font-extrabold tabular-nums text-white sm:text-4xl"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    {fmt(displayedFiveYears)}€
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-white/50">{t('landing.hero.sevenYears')}</p>
                  <p className="mt-1 text-xl font-bold tabular-nums text-white/70">{fmt(sevenYears)}€</p>
                </div>
              </div>

              {/* Punchline */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-xl font-bold text-white sm:text-2xl">
                  {t('landing.hero.punchline', { amount: `${fmt(fiveYears)}€` })}
                </p>
                <p className="mt-1.5 text-xs text-white/40">
                  {t('landing.hero.pct', { pct })}
                </p>
              </div>
            </div>

            {/* 5. CTA */}
            <motion.div
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              animate={shouldReduceMotion ? {} : {
                boxShadow: [
                  '0 4px 20px rgba(0,0,0,0.2)',
                  '0 4px 32px rgba(255,255,255,0.22)',
                  '0 4px 20px rgba(0,0,0,0.2)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
              className="inline-block w-full max-w-sm rounded-xl sm:w-auto"
            >
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#1a1a2e] shadow-lg transition-opacity hover:opacity-90"
              >
                {t('landing.hero.cta')}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </motion.div>

            {/* 6. Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('landing.hero.trustItem1')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('landing.hero.trustItem2')}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('landing.hero.trustItem3')}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div ref={statsRef} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: '+4M', label: t('landing.stats.contracts') },
              { value: '✓', label: t('landing.stats.lau') },
              { value: '⚡', label: t('landing.stats.speed') },
              { value: '↓', label: t('landing.stats.pdf') },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={statsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: 'easeOut' }}
                className="text-center"
              >
                <p className="text-xl font-extrabold text-[#1a1a2e]">{item.value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo ─────────────────────────────────────────────────────────── */}
      <div id="demo">
        <DemoSection />
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-white pb-20 pt-12 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              {t('landing.howItWorks.overline')}
            </p>
            <h2 className="heading-section text-gray-900">
              {t('landing.howItWorks.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { title: t('landing.howItWorks.step1Title'), desc: t('landing.howItWorks.step1Desc'), step: '1' },
              { title: t('landing.howItWorks.step2Title'), desc: t('landing.howItWorks.step2Desc'), step: '2' },
              { title: t('landing.howItWorks.step3Title'), desc: t('landing.howItWorks.step3Desc'), step: '3' },
            ].map((item, i) => (
              <div key={i} className="card-lift relative rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1a2e] text-white">
                    {HOW_IT_WORKS_ICONS[i]}
                  </div>
                  <span className="text-2xl font-extrabold text-gray-200">{item.step}</span>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-[1.7] text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              {t('landing.features.overline')}
            </p>
            <h2 className="heading-section text-gray-900">
              {t('landing.features.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={i} className="card-lift rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{t(f.titleKey)}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust / Why ──────────────────────────────────────────────────── */}
      <section className="bg-[#1a1a2e] py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="heading-section text-white">
              {t('landing.why.title')}
            </h2>
            <p className="mt-3 text-base leading-[1.7] text-white/50">
              {t('landing.why.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { stat: t('landing.why.item1Title'), desc: t('landing.why.item1Desc') },
              { stat: t('landing.why.item2Title'), desc: t('landing.why.item2Desc') },
              { stat: t('landing.why.item3Title'), desc: t('landing.why.item3Desc') },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="mb-2 text-base font-bold text-white">{item.stat}</p>
                <p className="text-sm leading-[1.7] text-white/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing teaser ───────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              {t('landing.pricing.overline')}
            </p>
            <h2 className="heading-section text-gray-900">
              {t('pricing.title')}
            </h2>
            <p className="mt-3 text-base text-gray-500">{t('pricing.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Single */}
            <div className="card-lift rounded-2xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-500">{t('pricing.plans.single.name')}</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">{t('pricing.plans.single.price')}</p>
              <p className="mt-1 text-sm text-gray-400">{t('pricing.plans.single.description')}</p>
              <Link
                to="/login"
                className="mt-6 block w-full rounded-xl border border-gray-300 py-2.5 text-center text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                {t('pricing.plans.single.cta')}
              </Link>
            </div>

            {/* Pack */}
            <div className="relative rounded-2xl border-2 border-[#1a1a2e] bg-[#1a1a2e] p-6 shadow-xl">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-bold text-white">
                {t('pricing.plans.pack.badge')}
              </span>
              <p className="text-sm font-semibold text-white/60">{t('pricing.plans.pack.name')}</p>
              <p className="mt-2 text-3xl font-extrabold text-white">{t('pricing.plans.pack.price')}</p>
              <p className="mt-1 text-sm text-white/50">{t('pricing.plans.pack.description')}</p>
              <Link
                to="/login"
                className="mt-6 block w-full rounded-xl bg-white py-2.5 text-center text-sm font-bold text-[#1a1a2e] transition-opacity hover:opacity-90"
              >
                {t('pricing.plans.pack.cta')}
              </Link>
            </div>

            {/* Pro */}
            <div className="card-lift rounded-2xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-500">{t('pricing.plans.pro.name')}</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">{t('pricing.plans.pro.price')}</p>
              <p className="mt-1 text-sm text-gray-400">{t('pricing.plans.pro.description')}</p>
              <Link
                to="/login"
                className="mt-6 block w-full rounded-xl border border-gray-300 py-2.5 text-center text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
              >
                {t('pricing.plans.pro.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-[#1a1a2e] py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            {t('landing.finalCta.title')}
          </h2>
          <p className="mt-3 text-base leading-[1.7] text-white/60">
            {t('landing.finalCta.subtitle')}
          </p>
          <motion.div
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            className="mt-8 inline-block rounded-xl"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-[#1a1a2e] shadow-lg transition-opacity hover:opacity-90"
            >
              {t('landing.finalCta.cta')}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
