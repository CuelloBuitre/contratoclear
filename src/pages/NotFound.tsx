import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        {/* 404 number */}
        <p className="text-8xl font-extrabold text-[#1a1a2e]/10 sm:text-9xl">404</p>

        {/* Icon */}
        <div className="mt-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a2e]/5">
          <svg className="h-8 w-8 text-[#1a1a2e]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:text-3xl">
          {t('notFound.title')}
        </h1>
        <p className="mt-2 text-base text-gray-500">{t('notFound.message')}</p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('notFound.cta')}
        </Link>
    </div>
  )
}
