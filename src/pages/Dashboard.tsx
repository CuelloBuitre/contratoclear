import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { FileText, BarChart3, MessageSquare, TrendingUp } from 'lucide-react'
import UploadZone from '@/components/analysis/UploadZone'
import AnalysisLoader from '@/components/analysis/AnalysisLoader'
import { useProfile } from '@/queries/profile'
import { useUploadStore, useAuthStore } from '@/store/useAppStore'
import type { UserType } from '@/types'

function hasActiveCredits(profile: { plan: string; credits_remaining: number; credits_expiry: string | null }): boolean {
  if (profile.plan === 'pro') return true
  if (profile.credits_remaining <= 0) return false
  if (profile.credits_expiry && new Date(profile.credits_expiry) <= new Date()) return false
  return true
}

function CreditsBadge({ plan, credits, expiry }: { plan: string; credits: number; expiry: string | null }) {
  const { t } = useTranslation()

  if (plan === 'pro') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-[#c9a96e]/30 bg-[#c9a96e]/8 px-4 py-2.5"
           style={{ backgroundColor: 'rgba(201,169,110,0.08)' }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#c9a96e' }} />
        <span className="text-sm font-medium text-[#0f0f1a]">{t('dashboard.proPlan')}</span>
      </div>
    )
  }

  if (credits > 0) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-[#c9a96e]/30 bg-white px-4 py-2.5"
           style={{ boxShadow: '0 1px 3px rgba(15,15,26,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-[#0f0f1a]"
                style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)' }}>
            {credits}
          </span>
          <span className="text-sm font-medium text-[#0f0f1a]">
            {t('dashboard.creditsRemaining', { count: credits })}
          </span>
        </div>
        {expiry && (
          <span className="rounded-full border border-[#e8e4dd] bg-[#fafaf8] px-2.5 py-0.5 text-xs font-medium text-[#6b6860]">
            {t('dashboard.creditsExpiry', {
              date: new Date(expiry).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            })}
          </span>
        )}
      </div>
    )
  }

  return null
}

interface QuickLinkCard {
  icon: React.ReactNode
  label: string
  href: string
  description: string
}

function QuickLinks({ links }: { links: QuickLinkCard[] }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      {links.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className="flex items-start gap-3 rounded-lg border border-[#e8e4dd] bg-white p-4 transition-all hover:shadow-md hover:border-[#c9a96e]/40"
          style={{ boxShadow: '0 1px 2px rgba(15,15,26,0.06)' }}
        >
          <div className="flex-shrink-0 text-[#c9a96e]">{link.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#0f0f1a]">{link.label}</h3>
            <p className="mt-0.5 text-xs text-[#6b6860]">{link.description}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

function TipSection({ tip }: { tip: string }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm text-blue-900">
        <span className="font-semibold">¿Sabías que? </span>
        {tip}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useProfile()
  const user = useAuthStore((s) => s.user)
  const uploadStatus = useUploadStore((s) => s.status)
  const creditsActive = profile ? hasActiveCredits(profile) : false
  const isAnalyzing = uploadStatus === 'uploading' || uploadStatus === 'analyzing'

  const firstName = user?.email?.split('@')[0] ?? null
  const userType: UserType = profile?.user_type ?? 'inquilino'

  // Determine content based on user type
  const getWelcomeMessage = () => {
    return t(`dashboard.${userType}.welcome`)
  }

  const getQuickLinks = (): QuickLinkCard[] => {
    const baseLinks: Record<UserType, QuickLinkCard[]> = {
      inquilino: [
        { icon: <TrendingUp className="h-5 w-5" />, label: t('dashboard.inquilino.calculadora'), href: '/calculadora', description: 'Calcula el aumento legal de tu renta' },
        { icon: <MessageSquare className="h-5 w-5" />, label: t('nav.legalChat'), href: '/consulta', description: 'Resuelve tus dudas sobre LAU' },
        { icon: <FileText className="h-5 w-5" />, label: t('nav.history'), href: '/history', description: 'Ver tus análisis anteriores' },
      ],
      propietario: [
        { icon: <FileText className="h-5 w-5" />, label: t('dashboard.propietario.cartas'), href: '/cartas', description: 'Genera cartas legales' },
        { icon: <TrendingUp className="h-5 w-5" />, label: t('dashboard.propietario.calculadora'), href: '/calculadora', description: 'Calcula actualización de renta' },
        { icon: <MessageSquare className="h-5 w-5" />, label: t('nav.legalChat'), href: '/consulta', description: 'Consulta legal sobre LAU' },
        { icon: <BarChart3 className="h-5 w-5" />, label: t('nav.monitor'), href: '/monitor', description: 'Gestiona tus contratos' },
      ],
      profesional: [
        { icon: <BarChart3 className="h-5 w-5" />, label: t('nav.monitor'), href: '/monitor', description: 'Monitor de contratos activos' },
        { icon: <FileText className="h-5 w-5" />, label: t('dashboard.profesional.cartas'), href: '/cartas', description: 'Genera cartas legales' },
        { icon: <MessageSquare className="h-5 w-5" />, label: t('nav.legalChat'), href: '/consulta', description: 'Consulta legal LAU' },
      ],
    }
    return baseLinks[userType]
  }

  const getTip = () => {
    return t(`dashboard.${userType}.tip`)
  }

  return (
    <div className="flex-1">
      {/* Page header */}
      <div className="border-b border-[#e8e4dd] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#0f0f1a]">
                {firstName ? `${getWelcomeMessage()}, ${firstName}` : getWelcomeMessage()}
              </h1>
              <p className="mt-0.5 text-sm text-[#6b6860]">
                {t(`dashboard.${userType}.subtitle`)}
              </p>
            </div>

            {/* Credits */}
            {!isLoading && profile && creditsActive && (
              <CreditsBadge
                plan={profile.plan}
                credits={profile.credits_remaining}
                expiry={profile.credits_expiry}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#c9a96e] border-t-transparent" />
          </div>
        ) : creditsActive ? (
          <>
            {/* Upload zone */}
            <div className="overflow-hidden rounded-lg border border-[#e8e4dd] bg-white mb-8"
                 style={{ boxShadow: '0 1px 3px rgba(15,15,26,0.08)' }}>
              {isAnalyzing ? <AnalysisLoader /> : <div className="p-6 sm:p-8"><UploadZone /></div>}
            </div>

            {/* Quick links */}
            <div className="mb-8">
              <h2 className="mb-4 text-base font-semibold text-[#0f0f1a]">{t('dashboard.quickLinks')}</h2>
              <QuickLinks links={getQuickLinks()} />
            </div>

            {/* Tip */}
            <TipSection tip={getTip()} />
          </>
        ) : (
          /* No credits state */
          <div className="rounded-lg border border-[#e8e4dd] bg-white p-8 text-center"
               style={{ boxShadow: '0 1px 3px rgba(15,15,26,0.08)' }}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
              <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-[#0f0f1a]">{t('dashboard.noCredits')}</h2>
            <p className="mt-1.5 text-sm text-[#6b6860]">{t('errors.noCredits')}</p>
            <Link
              to="/pricing"
              className="mt-6 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)', color: '#0f0f1a' }}
            >
              {t('dashboard.getMore')}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* Trust footnote */}
        <p className="mt-6 text-center text-xs text-[#6b6860]/60">
          {t('dashboard.trustNote')}
        </p>
      </div>
    </div>
  )
}
