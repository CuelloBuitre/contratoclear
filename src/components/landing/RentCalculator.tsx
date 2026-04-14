import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { animate } from 'framer-motion'

const DEFAULT_RENT = 950
const MIN_RENT = 400
const MAX_RENT = 3000
const STEP = 25
const PRICE = 3.99

function fmt(n: number): string {
  return n.toLocaleString('es-ES')
}

/** Smoothly animates a displayed number from its previous value to `target`. */
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
      onUpdate: (v) => setDisplayed(Math.round(v)),
    })
    return () => controls.stop()
  }, [target])

  return displayed
}

export default function RentCalculator() {
  const { t } = useTranslation()
  const [rent, setRent] = useState(DEFAULT_RENT)

  const perYear = rent * 12
  const fiveYears = rent * 12 * 5
  const sevenYears = rent * 12 * 7
  const pct = ((PRICE / fiveYears) * 100).toFixed(4)
  const fillPct = ((rent - MIN_RENT) / (MAX_RENT - MIN_RENT)) * 100

  const displayedFiveYears = useAnimatedNumber(fiveYears)

  return (
    <section className="bg-[#1a1a2e] py-20 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">

        {/* Headline */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t('calculator.title')}
          </h2>
          <p className="mt-3 text-base text-white/50">
            {t('calculator.subtitle')}
          </p>
        </div>

        {/* Current rent value */}
        <div className="mt-10 text-center">
          <p className="text-4xl font-extrabold tabular-nums text-white">
            {fmt(rent)}<span className="text-xl font-normal text-white/50">€/mes</span>
          </p>
        </div>

        {/* Slider */}
        <div className="mt-5 px-1">
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

        {/* Numbers */}
        <div className="mt-10 space-y-4">

          {/* Per year */}
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center">
            <p className="text-sm font-medium text-white/50">{t('calculator.perYear')}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-white">
              {fmt(perYear)}€
            </p>
          </div>

          {/* 5-year — THE WOW NUMBER */}
          <div className="rounded-2xl border border-white/25 bg-white/10 px-6 py-10 text-center">
            <p className="text-xs text-white/50" style={{ fontFamily: "'Inter', sans-serif" }}>{t('calculator.fiveYears')}</p>
            <p
              className="mt-4 text-6xl tabular-nums text-white sm:text-7xl"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              {fmt(displayedFiveYears)}€
            </p>
          </div>

          {/* 7-year — muted reference */}
          <p className="text-center text-sm text-white/40">
            {t('calculator.sevenYears')}:{' '}
            <span className="tabular-nums font-semibold text-white/60">{fmt(sevenYears)}€</span>
          </p>
        </div>

        {/* Divider + punchline */}
        <div className="mx-auto my-8 h-px w-24 bg-white/20" />
        <div className="text-center">
          <p className="text-2xl font-bold text-white sm:text-3xl">
            {t('calculator.punchline', { total: `${fmt(fiveYears)}€` })}
          </p>
          <p className="mt-2 text-sm text-white/40">
            {t('calculator.percentage', { pct })}
          </p>

          <Link
            to="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-[#1a1a2e] shadow-lg transition-opacity hover:opacity-90 active:scale-[0.97]"
          >
            {t('calculator.cta')}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}
