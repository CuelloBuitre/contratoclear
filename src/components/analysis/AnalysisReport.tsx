import { useTranslation } from 'react-i18next'
import ScoreBadge from '@/components/analysis/ScoreBadge'
import LegalUpdateBadge from '@/components/analysis/LegalUpdateBadge'
import ClauseCard from '@/components/analysis/ClauseCard'
import type { AnalysisResult } from '@/types'

interface AnalysisReportProps {
  result: AnalysisResult
}

export default function AnalysisReport({ result }: AnalysisReportProps) {
  const { t } = useTranslation()

  // Scanned PDF / unreadable document
  if (result.puntuacion === 'error') {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <LegalUpdateBadge lastUpdated={result.last_updated} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="mb-2 text-sm font-semibold text-gray-700">{t('analysis.score.error')}</p>
          <p className="text-sm leading-relaxed text-gray-500">{result.recomendacion}</p>
        </div>
      </div>
    )
  }

  const okCount = result.clausulas.filter((c) => c.estado === 'ok').length
  const warningCount = result.clausulas.filter((c) => c.estado === 'advertencia').length
  const illegalCount = result.clausulas.filter((c) => c.estado === 'ilegal').length

  return (
    <div className="space-y-6">
      {/* Score + legal badge */}
      <div className="flex flex-wrap items-center gap-3">
        <ScoreBadge puntuacion={result.puntuacion} />
        <LegalUpdateBadge lastUpdated={result.last_updated} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-3 text-center">
          <p className="text-2xl font-bold text-green-700">{okCount}</p>
          <p className="mt-0.5 text-xs text-green-600">{t('analysis.clauseStatus.ok')}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{warningCount}</p>
          <p className="mt-0.5 text-xs text-amber-600">{t('analysis.clauseStatus.advertencia')}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-center">
          <p className="text-2xl font-bold text-red-700">{illegalCount}</p>
          <p className="mt-0.5 text-xs text-red-600">{t('analysis.clauseStatus.ilegal')}</p>
        </div>
      </div>

      {/* Clauses */}
      <div className="space-y-2">
        {result.clausulas.map((clause, i) => (
          <ClauseCard key={i} clause={clause} />
        ))}
      </div>

      {/* Recommendation */}
      <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-4">
        <p className="mb-1 text-sm font-semibold text-indigo-900">{t('analysis.recommendation')}</p>
        <p className="text-sm text-indigo-800">{result.recomendacion}</p>
      </div>
    </div>
  )
}
