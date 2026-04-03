import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import UploadZone from '@/components/analysis/UploadZone'
import AnalysisLoader from '@/components/analysis/AnalysisLoader'
import { useProfile } from '@/queries/profile'
import { useUploadStore } from '@/store/useAppStore'

function hasActiveCredits(profile: { plan: string; credits_remaining: number; credits_expiry: string | null }): boolean {
  if (profile.plan === 'pro') return true
  if (profile.credits_remaining <= 0) return false
  if (profile.credits_expiry && new Date(profile.credits_expiry) <= new Date()) return false
  return true
}

function CreditsBadge({ plan, credits, expiry }: { plan: string; credits: number; expiry: string | null }) {
  if (plan === 'pro') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium text-green-800">Plan Pro — análisis ilimitados</span>
      </div>
    )
  }

  if (credits > 0) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
            {credits}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {credits === 1 ? 'análisis disponible' : 'análisis disponibles'}
          </span>
        </div>
        {expiry && (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Caducan el {new Date(expiry).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>
    )
  }

  return null
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useProfile()
  const uploadStatus = useUploadStore((s) => s.status)
  const creditsActive = profile ? hasActiveCredits(profile) : false
  const isAnalyzing = uploadStatus === 'uploading' || uploadStatus === 'analyzing'

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        {/* Page header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  Sube tu contrato en PDF y recibe el análisis en segundos.
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
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" />
            </div>
          ) : creditsActive ? (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {isAnalyzing ? <AnalysisLoader /> : <div className="p-6 sm:p-8"><UploadZone /></div>}
            </div>
          ) : (
            /* No credits state */
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">{t('dashboard.noCredits')}</h2>
              <p className="mt-1.5 text-sm text-gray-500">{t('errors.noCredits')}</p>
              <Link
                to="/pricing"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t('dashboard.getMore')}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}

          {/* Trust footnote */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Análisis basado en la LAU vigente · Actualizado a marzo 2026
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
