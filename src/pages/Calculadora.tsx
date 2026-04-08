import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import RentUpdateCalculator from '@/components/landing/RentUpdateCalculator'

export default function Calculadora() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-[800px] px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
          {t('rentCalculator.overline')}
        </p>
        <h1 className="font-display text-2xl font-bold text-[#0f0f1a] sm:text-3xl">
          {t('rentCalculator.title')}
        </h1>
        <p className="mt-3 text-base text-[#6b6860]">{t('rentCalculator.subtitle')}</p>
      </div>

      <RentUpdateCalculator />

      <p className="mt-8 text-center text-xs text-[#b0a898]">
        {t('rentCalculator.disclaimer')}
      </p>

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm text-[#6b6860] hover:text-[#0f0f1a]">
          ← {t('notFound.cta')}
        </Link>
      </div>
    </div>
  )
}
