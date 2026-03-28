import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScoreBadge from '@/components/analysis/ScoreBadge'
import { useAnalyses } from '@/queries/analyses'

export default function History() {
  const { t } = useTranslation()
  const { data: analyses, isLoading } = useAnalyses()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t('history.title')}</h1>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('history.newAnalysis')}
            </Link>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" />
            </div>
          )}

          {!isLoading && (!analyses || analyses.length === 0) && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mb-4 text-sm text-gray-500">{t('history.empty')}</p>
              <Link
                to="/dashboard"
                className="rounded-xl bg-[#1a1a2e] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t('history.analyzeCta')}
              </Link>
            </div>
          )}

          {analyses && analyses.length > 0 && (
            <div className="space-y-2">
              {analyses.map((analysis) => {
                const clauseCount = analysis.result_json?.clausulas?.length ?? 0
                return (
                  <Link
                    key={analysis.id}
                    to={`/analysis/${analysis.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-indigo-300 hover:shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">{analysis.filename}</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(analysis.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {clauseCount > 0 && (
                          <span className="ml-2 text-gray-300">
                            · {clauseCount} {t('history.clauses')}
                          </span>
                        )}
                      </p>
                    </div>
                    <ScoreBadge puntuacion={analysis.puntuacion} variant="compact" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
