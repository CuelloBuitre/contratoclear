import { useTranslation } from 'react-i18next'
import { motion, type Variants } from 'framer-motion'
import ScoreBadge from '@/components/analysis/ScoreBadge'
import LegalUpdateBadge from '@/components/analysis/LegalUpdateBadge'
import ClauseCard from '@/components/analysis/ClauseCard'
import { useCountUp } from '@/hooks/useCountUp'
import type { AnalysisResult } from '@/types'

interface AnalysisReportProps {
  result: AnalysisResult
}

const clauseContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const clauseItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

function StatCount({
  value,
  borderBg,
  textColor,
  labelColor,
  label,
}: {
  value: number
  borderBg: string
  textColor: string
  labelColor: string
  label: string
}) {
  const displayed = useCountUp(value, true)
  return (
    <div className={`rounded-lg border ${borderBg} px-3 py-3 text-center`}>
      <p className={`text-2xl font-bold ${textColor}`}>{displayed}</p>
      <p className={`mt-0.5 text-xs ${labelColor}`}>{label}</p>
    </div>
  )
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

      {/* Stats with count-up */}
      <div className="grid grid-cols-3 gap-3">
        <StatCount
          value={okCount}
          borderBg="border-green-200 bg-green-50"
          textColor="text-green-700"
          labelColor="text-green-600"
          label={t('analysis.clauseStatus.ok')}
        />
        <StatCount
          value={warningCount}
          borderBg="border-amber-200 bg-amber-50"
          textColor="text-amber-700"
          labelColor="text-amber-600"
          label={t('analysis.clauseStatus.advertencia')}
        />
        <StatCount
          value={illegalCount}
          borderBg="border-red-200 bg-red-50"
          textColor="text-red-700"
          labelColor="text-red-600"
          label={t('analysis.clauseStatus.ilegal')}
        />
      </div>

      {/* Clauses — staggered slide-in */}
      <motion.div
        className="space-y-2"
        variants={clauseContainer}
        initial="hidden"
        animate="show"
      >
        {result.clausulas.map((clause, i) => (
          <motion.div key={i} variants={clauseItem}>
            <ClauseCard clause={clause} />
          </motion.div>
        ))}
      </motion.div>

      {/* Recommendation */}
      <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-4">
        <p className="mb-1 text-sm font-semibold text-indigo-900">{t('analysis.recommendation')}</p>
        <p className="text-sm text-indigo-800">{result.recomendacion}</p>
      </div>
    </div>
  )
}
