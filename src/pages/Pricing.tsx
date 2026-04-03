import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuthStore } from '@/store/useAppStore'
import { useProfile } from '@/queries/profile'
import { useCheckout, type PriceType } from '@/hooks/useCheckout'

// ── Check icon ────────────────────────────────────────────────────────────────

function IconCheck({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── FAQ item ──────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <IconChevron open={open} />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-gray-500">{a}</p>
      )}
    </div>
  )
}

// ── Plan card ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  highlighted?: boolean
  amber?: boolean
  badge?: string
  name: string
  price: string
  priceSub: string
  description: string
  features: string[]
  cta: string
  isCurrentPlan: boolean
  isLoading: boolean
  hasError: boolean
  onCta: () => void
}

function PlanCard({
  highlighted,
  amber,
  badge,
  name,
  price,
  priceSub,
  description,
  features,
  cta,
  isCurrentPlan,
  isLoading,
  hasError,
  onCta,
}: PlanCardProps) {
  const { t } = useTranslation()

  return (
    <div
      className={[
        'relative flex flex-col rounded-2xl p-7 transition-shadow',
        highlighted
          ? 'border border-[#1a1a2e] bg-[#1a1a2e] shadow-2xl'
          : amber
            ? 'border-2 border-amber-600 bg-white shadow-xl'
            : 'border border-gray-200 bg-white shadow-sm hover:shadow-md',
      ].join(' ')}
    >
      {/* Popular badge */}
      {badge && (
        <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white shadow ${amber ? 'bg-amber-600' : 'bg-indigo-500'}`}>
          {badge}
        </span>
      )}

      {/* Header */}
      <div className="mb-6">
        <p className={`text-sm font-semibold ${highlighted ? 'text-white/60' : 'text-gray-500'}`}>
          {name}
        </p>
        <div className="mt-2 flex items-end gap-1">
          <span className={`text-4xl font-extrabold ${highlighted ? 'text-white' : 'text-gray-900'}`}>
            {price}
          </span>
          <span className={`mb-1 text-sm ${highlighted ? 'text-white/50' : 'text-gray-400'}`}>
            {priceSub}
          </span>
        </div>
        <p className={`mt-1.5 text-sm ${highlighted ? 'text-white/50' : 'text-gray-400'}`}>
          {description}
        </p>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-2.5">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className={`mt-0.5 shrink-0 ${highlighted ? 'text-indigo-300' : 'text-indigo-600'}`}>
              <IconCheck />
            </span>
            <span className={`text-sm ${highlighted ? 'text-white/80' : 'text-gray-600'}`}>{f}</span>
          </li>
        ))}
      </ul>

      {/* Error */}
      {hasError && (
        <p className={`mb-3 rounded-lg px-3 py-2 text-xs ${highlighted ? 'bg-white/10 text-red-300' : 'bg-red-50 text-red-600'}`}>
          Error al iniciar el pago. Inténtalo de nuevo.
        </p>
      )}

      {/* CTA */}
      {isCurrentPlan ? (
        <div className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
          highlighted ? 'border-white/20 text-white/50' : 'border-gray-200 text-gray-400'
        }`}>
          <IconCheck className="h-3.5 w-3.5" />
          {t('pricing.currentPlan')}
        </div>
      ) : (
        <button
          type="button"
          onClick={onCta}
          disabled={isLoading}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-opacity disabled:opacity-60',
            highlighted
              ? 'bg-white text-[#1a1a2e] hover:opacity-90'
              : 'bg-[#1a1a2e] text-white hover:opacity-90',
          ].join(' ')}
        >
          {isLoading && (
            <span className={`h-4 w-4 animate-spin rounded-full border-2 ${
              highlighted ? 'border-[#1a1a2e]/30 border-t-[#1a1a2e]' : 'border-white/30 border-t-white'
            }`} />
          )}
          {isLoading ? t('pricing.processing') : cta}
        </button>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Pricing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: profile } = useProfile()
  const { checkout, isLoading, error } = useCheckout()

  const [loadingPlan, setLoadingPlan] = useState<PriceType | null>(null)

  async function handleCheckout(priceId: string, priceType: PriceType) {
    if (!user) {
      navigate('/login')
      return
    }
    setLoadingPlan(priceType)
    await checkout(priceId, priceType)
    setLoadingPlan(null)
  }

  const singlePriceId = import.meta.env.VITE_STRIPE_PRICE_SINGLE as string
  const packPriceId   = import.meta.env.VITE_STRIPE_PRICE_PACK as string
  const proPriceId    = import.meta.env.VITE_STRIPE_PRICE_PRO as string

  const plans = [
    {
      type: 'single' as PriceType,
      priceId: singlePriceId,
      highlighted: false,
      name: t('pricing.plans.single.name'),
      price: t('pricing.plans.single.price'),
      priceSub: t('pricing.oneTime'),
      description: t('pricing.plans.single.description'),
      features: (t('pricing.plans.single.features', { returnObjects: true }) as string[]),
      cta: t('pricing.plans.single.cta'),
    },
    {
      type: 'pack' as PriceType,
      priceId: packPriceId,
      highlighted: false,
      amber: true,
      badge: t('pricing.plans.pack.badge'),
      name: t('pricing.plans.pack.name'),
      price: t('pricing.plans.pack.price'),
      priceSub: t('pricing.oneTime'),
      description: t('pricing.plans.pack.description'),
      features: (t('pricing.plans.pack.features', { returnObjects: true }) as string[]),
      cta: t('pricing.plans.pack.cta'),
    },
    {
      type: 'pro' as PriceType,
      priceId: proPriceId,
      highlighted: false,
      name: t('pricing.plans.pro.name'),
      price: t('pricing.plans.pro.price'),
      priceSub: `€ / ${t('pricing.perMonth')}`,
      description: t('pricing.plans.pro.description'),
      features: (t('pricing.plans.pro.features', { returnObjects: true }) as string[]),
      cta: t('pricing.plans.pro.cta'),
    },
  ]

  const faqItems = t('pricing.faq.items', { returnObjects: true }) as Array<{ q: string; a: string }>

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#1a1a2e] px-4 pb-20 pt-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Precios
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t('pricing.title')}
          </h1>
          <p className="mt-3 text-base text-white/60">{t('pricing.subtitle')}</p>

          {/* Static calculator stats */}
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-8 text-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">{t('calculator.pricingAverage')}</p>
              </div>
              <div className="hidden sm:block h-8 w-px bg-white/10" />
              <div>
                <p className="text-xl font-extrabold tabular-nums text-white">{t('calculator.pricingTotal')}</p>
              </div>
              <div className="hidden sm:block h-8 w-px bg-white/10" />
              <div>
                <p className="text-sm font-semibold text-indigo-300">{t('calculator.pricingCost')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plan cards ───────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6">
        <div className="mx-auto -mt-8 max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.type}
                highlighted={plan.highlighted}
                amber={'amber' in plan ? plan.amber : undefined}
                badge={'badge' in plan ? plan.badge : undefined}
                name={plan.name}
                price={plan.price}
                priceSub={plan.priceSub}
                description={plan.description}
                features={plan.features}
                cta={plan.cta}
                isCurrentPlan={profile?.plan === plan.type}
                isLoading={loadingPlan === plan.type && isLoading}
                hasError={loadingPlan === plan.type && !!error}
                onCta={() => handleCheckout(plan.priceId, plan.type)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pago seguro con Stripe
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Normativa LAU actualizada a 2026
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Tarjeta, Apple Pay, Google Pay
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Cancela cuando quieras
            </span>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            {t('pricing.faq.title')}
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-6">
            {faqItems.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>

          {/* Disclaimer */}
          <p className="mt-8 text-center text-xs text-gray-400">
            {t('footer.disclaimer')}
          </p>

          {/* Login nudge for unauthenticated users */}
          {!user && (
            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-center">
              <p className="text-sm text-indigo-700">
                Para comprar necesitas una cuenta.{' '}
                <Link to="/login" className="font-semibold underline hover:no-underline">
                  {t('pricing.loginRequired')}
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
