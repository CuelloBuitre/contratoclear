import { useTranslation } from 'react-i18next'

interface LegalUpdateBadgeProps {
  lastUpdated: string
}

export default function LegalUpdateBadge({ lastUpdated }: LegalUpdateBadgeProps) {
  const { t } = useTranslation()

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs text-blue-600">
      <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {t('analysis.updatedAt', { date: lastUpdated })}
    </span>
  )
}
