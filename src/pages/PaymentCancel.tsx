import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export default function PaymentCancel() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('payment.cancel.title')}</h1>
        <p className="mt-2 text-base text-gray-600">{t('payment.cancel.subtitle')}</p>

        {/* No charge reassurance */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5">
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-medium text-green-700">{t('payment.cancel.detail')}</span>
        </div>

        <Link
          to="/pricing"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
        >
          {t('payment.cancel.cta')}
        </Link>
    </div>
  )
}
