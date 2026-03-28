import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Analysis } from '@/types'

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    padding: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    color: '#111827',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logo: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#1a1a2e' },
  headerMeta: { fontSize: 8, color: '#9ca3af', textAlign: 'right' },

  // Score badge
  scoreBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
  },
  scoreBadgeText: { fontSize: 10, fontFamily: 'Helvetica-Bold' },

  // Summary stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statNum: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  statLabel: { fontSize: 8, color: '#6b7280' },

  // Filename
  filename: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  lawDate: { fontSize: 8, color: '#6366f1', marginBottom: 20 },

  // Clauses
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  clause: {
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  clauseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  clauseTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10, flex: 1, marginRight: 8 },
  clauseStatusPill: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  clauseStatusText: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  clauseBody: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  clauseDesc: { fontSize: 9, color: '#374151', marginBottom: 4, lineHeight: 1.5 },
  clauseAction: { fontSize: 9, color: '#4f46e5', fontFamily: 'Helvetica-Bold' },

  // Recommendation
  recBox: {
    marginTop: 20,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  recTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0369a1',
    marginBottom: 4,
  },
  recText: { fontSize: 9, color: '#374151', lineHeight: 1.6 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 44,
    right: 44,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  footerText: { fontSize: 7.5, color: '#9ca3af', textAlign: 'center', lineHeight: 1.5 },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const SCORE_COLORS: Record<string, { bg: string; text: string }> = {
  buena: { bg: '#dcfce7', text: '#15803d' },
  aceptable: { bg: '#fef9c3', text: '#a16207' },
  mala: { bg: '#fee2e2', text: '#b91c1c' },
}

const STATUS_COLORS: Record<string, { bg: string; headerBg: string; text: string }> = {
  ok: { bg: '#f0fdf4', headerBg: '#dcfce7', text: '#15803d' },
  advertencia: { bg: '#fffbeb', headerBg: '#fef9c3', text: '#a16207' },
  ilegal: { bg: '#fef2f2', headerBg: '#fee2e2', text: '#b91c1c' },
}

const STATUS_LABELS: Record<string, string> = {
  ok: 'Correcto',
  advertencia: 'Advertencia',
  ilegal: 'Ilegal',
}

const SCORE_LABELS: Record<string, string> = {
  buena: 'Contrato favorable',
  aceptable: 'Contrato aceptable',
  mala: 'Contrato problemático',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalysisPDFReport({ analysis }: { analysis: Analysis }) {
  const { result_json: result } = analysis
  const scoreColor = SCORE_COLORS[result.puntuacion] ?? { bg: '#f3f4f6', text: '#374151' }

  const okCount = result.clausulas.filter((c) => c.estado === 'ok').length
  const warnCount = result.clausulas.filter((c) => c.estado === 'advertencia').length
  const illegalCount = result.clausulas.filter((c) => c.estado === 'ilegal').length

  return (
    <Document title={`Análisis — ${analysis.filename}`} author="ClausulaAI">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.logo}>ClausulaAI</Text>
          <View>
            <Text style={s.headerMeta}>
              {new Date(analysis.created_at).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
            <Text style={[s.headerMeta, { marginTop: 2 }]}>
              Normativa: {result.last_updated}
            </Text>
          </View>
        </View>

        {/* Filename */}
        <Text style={s.filename}>{analysis.filename}</Text>
        <Text style={s.lawDate}>Análisis según normativa de {result.last_updated}</Text>

        {/* Score badge */}
        <View style={[s.scoreBadge, { backgroundColor: scoreColor.bg }]}>
          <Text style={[s.scoreBadgeText, { color: scoreColor.text }]}>
            {SCORE_LABELS[result.puntuacion] ?? result.puntuacion}
          </Text>
        </View>

        {/* Summary stats */}
        <View style={s.statsRow}>
          <View style={[s.statBox, { backgroundColor: '#f0fdf4' }]}>
            <Text style={[s.statNum, { color: '#15803d' }]}>{okCount}</Text>
            <Text style={s.statLabel}>Correctas</Text>
          </View>
          <View style={[s.statBox, { backgroundColor: '#fffbeb' }]}>
            <Text style={[s.statNum, { color: '#a16207' }]}>{warnCount}</Text>
            <Text style={s.statLabel}>Advertencias</Text>
          </View>
          <View style={[s.statBox, { backgroundColor: '#fef2f2' }]}>
            <Text style={[s.statNum, { color: '#b91c1c' }]}>{illegalCount}</Text>
            <Text style={s.statLabel}>Ilegales</Text>
          </View>
        </View>

        {/* Clauses */}
        <Text style={s.sectionTitle}>Cláusulas analizadas</Text>

        {result.clausulas.map((clause, i) => {
          const colors = STATUS_COLORS[clause.estado] ?? STATUS_COLORS.ok
          return (
            <View key={i} style={s.clause}>
              <View style={[s.clauseHeader, { backgroundColor: colors.headerBg }]}>
                <Text style={s.clauseTitle}>{clause.titulo}</Text>
                <View style={[s.clauseStatusPill, { backgroundColor: colors.bg }]}>
                  <Text style={[s.clauseStatusText, { color: colors.text }]}>
                    {STATUS_LABELS[clause.estado] ?? clause.estado}
                  </Text>
                </View>
              </View>
              <View style={s.clauseBody}>
                <Text style={s.clauseDesc}>{clause.descripcion}</Text>
                {clause.accion ? (
                  <Text style={s.clauseAction}>→ {clause.accion}</Text>
                ) : null}
              </View>
            </View>
          )
        })}

        {/* Recommendation */}
        <View style={s.recBox}>
          <Text style={s.recTitle}>Recomendación principal</Text>
          <Text style={s.recText}>{result.recomendacion}</Text>
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Análisis basado en LAU 29/1994 · Ley de Vivienda 12/2023 · RDL 9/2024 · Actualizado a {result.last_updated}
            {'\n'}Este análisis no sustituye el asesoramiento legal profesional. clausulaai.es
          </Text>
        </View>

      </Page>
    </Document>
  )
}
