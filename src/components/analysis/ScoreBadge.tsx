import { useTranslation } from 'react-i18next'
import type { Puntuacion } from '@/types'

interface ScoreBadgeProps {
  puntuacion: Puntuacion
  variant?: 'default' | 'compact'
}

const colorMap: Record<Puntuacion, string> = {
  buena: 'bg-green-100 text-green-800 border-green-200',
  aceptable: 'bg-amber-100 text-amber-800 border-amber-200',
  mala: 'bg-red-100 text-red-800 border-red-200',
}

export default function ScoreBadge({ puntuacion, variant = 'default' }: ScoreBadgeProps) {
  const { t } = useTranslation()

  const size = variant === 'compact' ? 'px-2.5 py-0.5 text-xs' : 'px-4 py-1.5 text-base'

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${size} ${colorMap[puntuacion]}`}>
      {t(`analysis.score.${puntuacion}`)}
    </span>
  )
}
