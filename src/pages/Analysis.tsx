import { useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnalysisReport from '@/components/analysis/AnalysisReport'
import ScoreBadge from '@/components/analysis/ScoreBadge'
import { useAnalysis } from '@/queries/analyses'
import type { Analysis as AnalysisType, Puntuacion } from '@/types'

// ── PDF ───────────────────────────────────────────────────────────────────────

const pdf = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 9, color: '#6366f1', marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginTop: 16, marginBottom: 6 },
  clauseContainer: { marginBottom: 10 },
  clauseHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  clauseTitle: { fontWeight: 'bold', flex: 1, marginRight: 8 },
  clauseStatus: { fontSize: 9, textTransform: 'uppercase' },
  clauseDesc: { color: '#374151', marginBottom: 2 },
  clauseAction: { color: '#4f46e5' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginTop: 8 },
  recommendation: { color: '#374151', lineHeight: 1.5 },
})

function AnalysisPDF({ analysis }: { analysis: AnalysisType }) {
  return (
    <Document title={`Análisis — ${analysis.filename}`}>
      <Page size="A4" style={pdf.page}>
        <Text style={pdf.title}>{analysis.filename}</Text>
        <Text style={pdf.meta}>
          Análisis según normativa de {analysis.result_json.last_updated}
          {' · '}
          {new Date(analysis.created_at).toLocaleDateString('es-ES')}
        </Text>

        <Text style={pdf.sectionTitle}>Cláusulas analizadas</Text>
        {analysis.result_json.clausulas.map((clause, i) => (
          <View key={i} style={pdf.clauseContainer}>
            <View style={pdf.clauseHeader}>
              <Text style={pdf.clauseTitle}>{clause.titulo}</Text>
              <Text style={pdf.clauseStatus}>{clause.estado}</Text>
            </View>
            <Text style={pdf.clauseDesc}>{clause.descripcion}</Text>
            {clause.accion ? <Text style={pdf.clauseAction}>→ {clause.accion}</Text> : null}
            <View style={pdf.divider} />
          </View>
        ))}

        <Text style={pdf.sectionTitle}>Recomendación</Text>
        <Text style={pdf.recommendation}>{analysis.result_json.recomendacion}</Text>
      </Page>
    </Document>
  )
}

// ── Score header gradient ─────────────────────────────────────────────────────

const scoreGradient: Record<Puntuacion, string> = {
  buena: 'from-green-50 to-white border-green-100',
  aceptable: 'from-amber-50 to-white border-amber-100',
  mala: 'from-red-50 to-white border-red-100',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Analysis() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { data: analysis, isLoading, error } = useAnalysis(id!)

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
  const gradient = scoreGradient[analysis.result_json.puntuacion]

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
                <ScoreBadge puntuacion={analysis.result_json.puntuacion} />
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

            {/* Download button */}
            <PDFDownloadLink
              document={<AnalysisPDF analysis={analysis} />}
              fileName={pdfFilename}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              {({ loading }) =>
                loading ? (
                  <span className="opacity-50">Generando…</span>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t('analysis.downloadPdf')}
                  </>
                )
              }
            </PDFDownloadLink>
          </div>
        </div>
      </div>

      {/* Report body */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <AnalysisReport result={analysis.result_json} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
