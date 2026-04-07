import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import type { Clause } from '@/types'

interface ClauseCardProps {
  clause: Clause
}

const statusStyles = {
  ok: {
    leftBorder: 'border-l-[#14532d]',
    badge: 'bg-[#14532d] text-white',
    action: 'text-[#14532d]',
  },
  advertencia: {
    leftBorder: 'border-l-[#92400e]',
    badge: 'bg-[#92400e] text-white',
    action: 'text-[#92400e]',
  },
  ilegal: {
    leftBorder: 'border-l-[#7f1d1d]',
    badge: 'bg-[#7f1d1d] text-white',
    action: 'text-[#7f1d1d]',
  },
}

export default function ClauseCard({ clause }: ClauseCardProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const s = statusStyles[clause.estado]

  return (
    <div className={`overflow-hidden rounded-lg border border-[#e8e4dd] border-l-4 ${s.leftBorder} bg-white`}
         style={{ boxShadow: '0 1px 3px rgba(15,15,26,0.06)' }}>
      <motion.button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        whileTap={{ scale: 0.99 }}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fafaf8]"
      >
        <span className="truncate text-sm font-medium text-[#0f0f1a]">{clause.titulo}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.05em] ${s.badge}`}>
            {t(`analysis.clauseStatus.${clause.estado}`)}
          </span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="h-4 w-4 text-[#6b6860]"
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
            <div className="space-y-2 border-t border-[#e8e4dd] bg-[#fafaf8] px-4 py-3">
              <p className="text-sm leading-[1.7] text-[#6b6860]">{clause.descripcion}</p>
              {clause.accion && (
                <p className={`text-sm font-medium ${s.action}`}>
                  → {clause.accion}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
