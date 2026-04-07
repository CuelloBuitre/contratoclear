import { useTranslation } from 'react-i18next'
import type { Puntuacion } from '@/types'

interface ScoreBadgeProps {
  puntuacion: Puntuacion
  variant?: 'default' | 'compact'
}

const colorMap: Record<Puntuacion, string> = {
  buena:    'bg-[#14532d] text-white',
  aceptable:'bg-[#92400e] text-white',
  mala:     'bg-[#7f1d1d] text-white',
  error:    'bg-[#374151] text-white',
}

export default function ScoreBadge({ puntuacion, variant = 'default' }: ScoreBadgeProps) {
  const { t } = useTranslation()

  const size = variant === 'compact' ? 'px-2.5 py-0.5 text-[11px]' : 'px-4 py-1.5 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded font-semibold uppercase tracking-[0.05em] ${size} ${colorMap[puntuacion]}`}
    >
      {t(`analysis.score.${puntuacion}`)}
    </span>
  )
}
