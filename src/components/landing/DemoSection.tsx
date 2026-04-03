import { useState, useRef } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from 'framer-motion'
import ScoreBadge from '@/components/analysis/ScoreBadge'
import LegalUpdateBadge from '@/components/analysis/LegalUpdateBadge'
import type { AnalysisResult, Clause, ClauseStatus } from '@/types'

// ── Demo data ─────────────────────────────────────────────────────────────────

const LAST_UPDATED = 'marzo 2026'

const SCENARIOS: Array<{ label: string; sublabel: string; result: AnalysisResult }> = [
  {
    label: 'Contrato correcto',
    sublabel: 'Puedes firmarlo con tranquilidad',
    result: {
      puntuacion: 'buena',
      last_updated: LAST_UPDATED,
      clausulas: [
        {
          titulo: 'Fianza legal',
          estado: 'ok',
          descripcion: 'Una mensualidad de fianza, conforme al Art. 36 LAU. El plazo de devolución de 30 días está incluido correctamente.',
          accion: 'No es necesaria ninguna acción.',
        },
        {
          titulo: 'Duración mínima',
          estado: 'ok',
          descripcion: '5 años con prórroga tácita de 3 años adicionales, conforme al mínimo legal para arrendadores persona física.',
          accion: 'El contrato cumple el mínimo legal.',
        },
        {
          titulo: 'Actualización de renta',
          estado: 'ok',
          descripcion: 'La renta se actualiza según el Índice de Referencia del INE, conforme a la Ley 12/2023 y Resolución INE 2024.',
          accion: 'Comprueba cada enero el índice publicado en ine.es.',
        },
        {
          titulo: 'Gastos de agencia',
          estado: 'ok',
          descripcion: 'Los gastos de gestión inmobiliaria van a cargo del arrendador, tal como exige la Ley de Vivienda 12/2023.',
          accion: 'No debes abonar ningún gasto de gestión.',
        },
      ],
      recomendacion: 'Este contrato es favorable y cumple la normativa vigente. Puedes firmarlo con tranquilidad.',
    },
  },
  {
    label: 'Cláusulas abusivas',
    sublabel: 'Negocia antes de firmar',
    result: {
      puntuacion: 'aceptable',
      last_updated: LAST_UPDATED,
      clausulas: [
        {
          titulo: 'Garantía adicional',
          estado: 'advertencia',
          descripcion: 'Se exigen 2 meses de garantía adicional. Legal, pero al límite máximo permitido por el Art. 36.5 LAU.',
          accion: 'Negocia reducirla a 1 mes adicional si es posible.',
        },
        {
          titulo: 'Referencia de renta',
          estado: 'advertencia',
          descripcion: 'Se usa el IPC como índice de actualización. El IPC dejó de ser válido el 01/01/2025 para contratos de alquiler.',
          accion: 'Exige cambiar la referencia al Índice INE antes de firmar.',
        },
        {
          titulo: 'Prohibición de obras',
          estado: 'advertencia',
          descripcion: 'Se prohíben todas las obras incluyendo las de accesibilidad. Abusivo, aunque legalmente discutible.',
          accion: 'Si tienes necesidades de accesibilidad, consúltalo antes de firmar.',
        },
        {
          titulo: 'Duración',
          estado: 'ok',
          descripcion: '5 años garantizados con prórroga tácita de 3 años. Conforme al mínimo legal.',
          accion: 'El contrato cumple el mínimo legal.',
        },
      ],
      recomendacion: 'El contrato tiene cláusulas abusivas pero no ilegales. Negocia los puntos marcados en advertencia antes de firmar.',
    },
  },
  {
    label: 'Contrato ilegal',
    sublabel: 'Las cláusulas ilegales son nulas aunque las firmes',
    result: {
      puntuacion: 'mala',
      last_updated: LAST_UPDATED,
      clausulas: [
        {
          titulo: 'Fianza excesiva',
          estado: 'ilegal',
          descripcion: 'Se exigen 3 mensualidades de fianza. La ley fija exactamente 1 mensualidad, no más.',
          accion: 'Esta cláusula es nula. Solo estás obligado a pagar 1 mes de fianza.',
        },
        {
          titulo: 'Gastos de agencia',
          estado: 'ilegal',
          descripcion: 'Se obliga al inquilino a pagar los gastos de gestión inmobiliaria. Ilegal desde la Ley de Vivienda 12/2023.',
          accion: 'No pagues estos gastos. La cláusula es nula de pleno derecho.',
        },
        {
          titulo: 'Acceso del propietario',
          estado: 'ilegal',
          descripcion: 'El propietario puede entrar con 24h de aviso. Viola el Art. 18 CE sobre inviolabilidad del domicilio.',
          accion: 'Nula aunque esté firmada. El arrendador necesita tu consentimiento expreso.',
        },
        {
          titulo: 'Subida fija del 5%',
          estado: 'ilegal',
          descripcion: 'Se aplica una subida fija del 5% anual. Supera el Índice INE 2025 (~2,2%) y es ilegal.',
          accion: 'Solo se puede aplicar el índice INE. El exceso no es legalmente exigible.',
        },
      ],
      recomendacion: 'Este contrato tiene múltiples cláusulas ilegales. Las cláusulas ilegales son nulas aunque las hayas firmado, pero exige su eliminación antes de firmar.',
    },
  },
]

// ── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<ClauseStatus, { dot: string; badge: string; border: string; bg: string }> = {
  ok: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-800', border: 'border-green-200', bg: 'bg-green-50' },
  advertencia: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800', border: 'border-amber-200', bg: 'bg-amber-50' },
  ilegal: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-800', border: 'border-red-200', bg: 'bg-red-50' },
}

const statusLabel: Record<ClauseStatus, string> = {
  ok: 'Correcto',
  advertencia: 'Advertencia',
  ilegal: 'Ilegal',
}

// ── Mini clause card ──────────────────────────────────────────────────────────

function DemoClauseCard({ clause }: { clause: Clause }) {
  const [open, setOpen] = useState(false)
  const s = statusConfig[clause.estado]

  return (
    <div className={`overflow-hidden rounded-xl border ${s.border} bg-white`}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
          <span className="truncate text-sm font-medium text-gray-800">{clause.titulo}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
            {statusLabel[clause.estado]}
          </span>
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-3.5 w-3.5 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className={`border-t ${s.border} ${s.bg} px-4 py-3 space-y-1.5`}>
              <p className="text-sm text-gray-700">{clause.descripcion}</p>
              <p className="text-sm font-medium text-gray-900">
                <span className="text-indigo-600">→</span> {clause.accion}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Stagger variants ──────────────────────────────────────────────────────────

const clauseContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const clauseItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: 'easeOut' as const } },
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DemoSection() {
  const [active, setActive] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  const scenario = SCENARIOS[active]
  const result = scenario.result

  const okCount = result.clausulas.filter((c) => c.estado === 'ok').length
  const warnCount = result.clausulas.filter((c) => c.estado === 'advertencia').length
  const illegalCount = result.clausulas.filter((c) => c.estado === 'ilegal').length

  return (
    <section className="bg-white py-20 sm:py-24">
      <div ref={sectionRef} className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">Demostración</p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ve cómo funciona antes de pagar
          </h2>
          <p className="mt-3 text-base text-gray-500">
            Resultados reales de tres contratos tipo. Haz clic en cada cláusula para ver el detalle.
          </p>
        </div>

        {/* Tab selector */}
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:gap-3">
          {SCENARIOS.map((s, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              className={[
                'flex-1 rounded-xl border px-4 py-3 text-left transition-all',
                active === i
                  ? 'border-transparent bg-[#1a1a2e] text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
              ].join(' ')}
            >
              <p className={`text-sm font-semibold ${active === i ? 'text-white' : 'text-gray-800'}`}>
                {s.label}
              </p>
              <p className={`mt-0.5 text-xs ${active === i ? 'text-white/70' : 'text-gray-400'}`}>
                {s.sublabel}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Demo card */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
          {/* Score + badge */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <ScoreBadge puntuacion={result.puntuacion} />
            <LegalUpdateBadge lastUpdated={result.last_updated} />
          </div>

          {/* Stats */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-green-200 bg-white px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-green-700">{okCount}</p>
              <p className="text-xs text-green-600">Correctas</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-amber-700">{warnCount}</p>
              <p className="text-xs text-amber-600">Advertencias</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-white px-3 py-2.5 text-center">
              <p className="text-xl font-bold text-red-700">{illegalCount}</p>
              <p className="text-xs text-red-600">Ilegales</p>
            </div>
          </div>

          {/* Clauses — staggered, re-triggers on scenario change via key */}
          <motion.div
            key={active}
            className="space-y-2"
            variants={shouldReduceMotion ? {} : clauseContainer}
            initial={shouldReduceMotion ? false : 'hidden'}
            animate={isInView ? 'show' : 'hidden'}
          >
            {result.clausulas.map((clause, i) => (
              <motion.div key={i} variants={shouldReduceMotion ? {} : clauseItem}>
                <DemoClauseCard clause={clause} />
              </motion.div>
            ))}
          </motion.div>

          {/* Recommendation */}
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Recomendación</p>
            <p className="mt-1 text-sm text-indigo-900">{result.recomendacion}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <motion.div
            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
            className="inline-block rounded-xl"
          >
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] px-8 py-4 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
            >
              Analizar mi contrato — desde 3,99€
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
          <p className="mt-3 text-xs text-gray-400">Sin suscripción. Paga solo lo que necesitas.</p>
        </div>
      </div>
    </section>
  )
}
