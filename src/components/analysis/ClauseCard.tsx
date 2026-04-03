import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Clause } from '@/types'

interface ClauseCardProps {
  clause: Clause
}

const statusStyles = {
  ok: {
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
  },
  advertencia: {
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
  ilegal: {
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
  },
}

export default function ClauseCard({ clause }: ClauseCardProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const s = statusStyles[clause.estado]

  return (
    <div className={`overflow-hidden rounded-lg border ${s.border} bg-white`}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
          <span className="truncate text-sm font-medium text-gray-800">{clause.titulo}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${s.badge}`}>
            {t(`analysis.clauseStatus.${clause.estado}`)}
          </span>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="space-y-2 border-t border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-sm text-gray-700">{clause.descripcion}</p>
          {clause.accion && (
            <p className="text-sm font-medium text-gray-900">
              <span className="text-indigo-600">→</span> {clause.accion}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
