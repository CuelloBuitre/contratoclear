import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import type { Clause } from '@/types'

interface ClauseCardProps {
  clause: Clause
}

const statusStyles = {
  ok: {
    leftBorder: 'border-l-[#16a34a]',
    badge: 'bg-[#16a34a] text-white',
  },
  advertencia: {
    leftBorder: 'border-l-[#d97706]',
    badge: 'bg-[#d97706] text-white',
  },
  ilegal: {
    leftBorder: 'border-l-[#dc2626]',
    badge: 'bg-[#dc2626] text-white',
  },
}

export default function ClauseCard({ clause }: ClauseCardProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const s = statusStyles[clause.estado]

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 border-l-4 ${s.leftBorder} bg-white`}>
      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        whileTap={{ scale: 0.98 }}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <span className="truncate text-sm font-medium text-gray-800">{clause.titulo}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.badge}`}>
            {t(`analysis.clauseStatus.${clause.estado}`)}
          </span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 border-t border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-sm leading-[1.7] text-gray-700">{clause.descripcion}</p>
              {clause.accion && (
                <p className="text-sm font-medium text-gray-900">
                  <span className="text-indigo-600">→</span> {clause.accion}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
