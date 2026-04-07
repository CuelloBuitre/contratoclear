import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
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
      className={`h-5 w-5 text-[#6b6860] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
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
    <div className="border-b border-[#e8e4dd] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-[#0f0f1a]">{q}</span>
        <IconChevron open={open} />
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-[#6b6860]">{a}</p>
      )}
    </div>
  )
}

// ── Plan card ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  highlighted?: boolean
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
        'relative flex flex-col rounded-lg p-7 transition-shadow',
        highlighted
          ? 'border-2 border-[#c9a96e] bg-white'
          : 'border border-[#e8e4dd] bg-white hover:shadow-md',
      ].join(' ')}
      style={highlighted
        ? { boxShadow: '0 8px 40px rgba(201,169,110,0.25)' }
        : { boxShadow: '0 1px 3px rgba(15,15,26,0.06)' }}
    >
      {/* Badge */}
      {badge && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold shadow"
          style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)', color: '#0f0f1a' }}
        >
          {badge}
        </span>
      )}

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-[#6b6860]">
          {name}
        </p>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-4xl font-extrabold text-[#0f0f1a]"
                style={{ fontFamily: "'Playfair Display', serif" }}>
            {price}
          </span>
          <span className="mb-1 text-sm text-[#6b6860]">
            {priceSub}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-[#6b6860]">
          {description}
        </p>
      </div>

      {/* Features */}
      <ul className="mb-8 flex-1 space-y-2.5">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-[#c9a96e]">
              <IconCheck />
            </span>
            <span className="text-sm text-[#6b6860]">{f}</span>
          </li>
        ))}
      </ul>

      {/* Error */}
      {hasError && (
        <p className="mb-3 rounded-md px-3 py-2 text-xs bg-red-50 text-red-600">
          Error al iniciar el pago. Inténtalo de nuevo.
        </p>
      )}

      {/* CTA */}
      {isCurrentPlan ? (
        <div className="flex items-center justify-center gap-2 rounded-md border border-[#e8e4dd] px-4 py-3 text-sm font-semibold text-[#6b6860]">
          <IconCheck className="h-3.5 w-3.5" />
          {t('pricing.currentPlan')}
        </div>
      ) : (
        <button
          type="button"
          onClick={onCta}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition-all disabled:opacity-60 hover:opacity-90 hover:-translate-y-px"
          style={highlighted
            ? { background: 'linear-gradient(135deg, #c9a96e, #b8934a)', color: '#0f0f1a' }
            : { backgroundColor: '#0f0f1a', color: '#ffffff' }}

        >
          {isLoading && (
            <span className={`h-4 w-4 animate-spin rounded-full border-2 ${
              highlighted ? 'border-[#0f0f1a]/30 border-t-[#0f0f1a]' : 'border-white/30 border-t-white'
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
      highlighted: true,
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
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0f0f1a] px-4 pb-20 pt-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#c9a96e]">
            {t('landing.pricing.overline')}
          </p>
          <h1 className="heading-display text-white">
            {t('pricing.title')}
          </h1>
          <p className="mt-3 text-base text-white/60">{t('pricing.subtitle')}</p>

          {/* Stats banner */}
          <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-white/10 px-6 py-5"
               style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
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
                <p className="text-sm font-semibold" style={{ color: '#c9a96e' }}>{t('calculator.pricingCost')}</p>
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
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#6b6860]">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Pago seguro con Stripe
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Normativa LAU actualizada a 2026
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Tarjeta, Apple Pay, Google Pay
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <h2 className="heading-section mb-8 text-center text-[#0f0f1a]">
            {t('pricing.faq.title')}
          </h2>
          <div className="rounded-lg border border-[#e8e4dd] bg-[#fafaf8] px-6"
               style={{ boxShadow: '0 1px 3px rgba(15,15,26,0.06)' }}>
            {faqItems.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>

          {/* Disclaimer */}
          <p className="mt-8 text-center text-xs text-[#6b6860]/60">
            {t('footer.disclaimer')}
          </p>

          {/* Login nudge */}
          {!user && (
            <div className="mt-6 rounded-lg border border-[#c9a96e]/30 bg-[#c9a96e]/8 px-5 py-4 text-center"
                 style={{ backgroundColor: 'rgba(201,169,110,0.06)' }}>
              <p className="text-sm text-[#0f0f1a]">
                Para comprar necesitas una cuenta.{' '}
                <Link to="/login" className="font-semibold underline hover:no-underline"
                      style={{ color: '#c9a96e' }}>
                  {t('pricing.loginRequired')}
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
