import { useEffect } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { profileKeys } from '@/queries/keys'

export default function PaymentSuccess() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Invalidate profile cache so credits update immediately
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: profileKeys.all })
  }, [queryClient])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        {/* Success ring */}
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-30" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('payment.success.title')}</h1>
        <p className="mt-2 text-base text-gray-600">{t('payment.success.subtitle')}</p>
        <p className="mt-1 text-sm text-gray-400">{t('payment.success.detail')}</p>

        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          {t('payment.success.cta')}
        </Link>
      </main>

      <Footer />
    </div>
  )
}
