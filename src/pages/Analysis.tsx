import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'
import AnalysisReport from '@/components/analysis/AnalysisReport'
import ContractChat from '@/components/analysis/ContractChat'
import ScoreBadge from '@/components/analysis/ScoreBadge'
import { useAnalysis } from '@/queries/analyses'
import type { Puntuacion } from '@/types'

// ── Score header gradient ─────────────────────────────────────────────────────

const scoreGradient: Record<Puntuacion, string> = {
  buena: 'from-green-50 to-white border-green-100',
  aceptable: 'from-amber-50 to-white border-amber-100',
  mala: 'from-red-50 to-white border-red-100',
  error: 'from-gray-50 to-white border-gray-100',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Analysis() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data: analysis, isLoading, error } = useAnalysis(id!)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-medium text-gray-700">{t('errors.generic')}</p>
          <Link to="/history" className="mt-4 text-sm font-medium text-indigo-600 hover:underline">
            ← {t('analysis.backToHistory')}
          </Link>
        </div>
      </div>
    )
  }

  const pdfFilename = `informe-${analysis.filename.replace(/\.pdf$/i, '')}.pdf`

  async function handleDownload() {
    setIsGenerating(true)
    try {
      const [{ pdf }, { default: AnalysisPDFReport }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/analysis/AnalysisPDFReport'),
      ])
      const blob = await pdf(<AnalysisPDFReport analysis={analysis!} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = pdfFilename
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsGenerating(false)
    }
  }
  const gradient = scoreGradient[analysis.result_json.puntuacion] ?? scoreGradient.error
  const isError = analysis.result_json.puntuacion === 'error'
  const illegalCount = isError ? 0 : analysis.result_json.clausulas.filter((c) => c.estado === 'ilegal').length

  function handleShare() {
    const text = illegalCount > 0
      ? t('analysis.shareText', { count: illegalCount })
      : t('analysis.shareTextZero')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      {/* Score header band */}
      <div className={`border-b bg-gradient-to-b ${gradient}`}>
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          {/* Back link */}
          <Link
            to="/history"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('analysis.backToHistory')}
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.05 }}
                  className="inline-flex"
                >
                  <ScoreBadge puntuacion={analysis.result_json.puntuacion} />
                </motion.div>
                <span className="text-xs text-gray-400">
                  {new Date(analysis.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              <h1 className="mt-2 max-w-md truncate text-lg font-bold text-gray-900">
                {analysis.filename}
              </h1>
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Share button */}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                {copied ? (
                  <>
                    <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">{t('analysis.copied')}</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    {t('analysis.shareButton')}
                  </>
                )}
              </button>

              {/* PDF download */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    <span>Generando…</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('analysis.downloadPdf')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report body */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <ErrorBoundary message={t('errors.boundaryAnalysis')}>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <AnalysisReport result={analysis.result_json} />
            </div>

            {!isError && (
              <div className="mt-4">
                <ContractChat analysisId={analysis.id} result={analysis.result_json} />
              </div>
            )}
          </ErrorBoundary>
        </div>
      </main>

      <Footer />
    </div>
  )
}
