import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

// INE index 2025 — update monthly
const INE_INDEX_2025 = 2.2
const LAW_DATE = new Date('2023-05-26')

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function RentUpdateCalculator() {
  const { t } = useTranslation()

  const [rentaActual, setRentaActual] = useState('')
  const [fechaFirma, setFechaFirma] = useState('')

  const renta = parseFloat(rentaActual.replace(',', '.')) || 0
  const fecha = fechaFirma ? new Date(fechaFirma) : null
  const isAfterLaw = fecha ? fecha >= LAW_DATE : null

  const indiceAplicable = isAfterLaw === true ? INE_INDEX_2025 : null
  const incremento = indiceAplicable !== null && renta > 0 ? (renta * indiceAplicable) / 100 : null
  const rentaNueva = incremento !== null ? renta + incremento : null
  const hasResult = renta > 0 && fecha !== null && isAfterLaw !== null

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#e8e4dd] bg-white p-6 sm:p-8"
         style={{ boxShadow: '0 2px 12px rgba(15,15,26,0.08)' }}>
      <div className="space-y-4">
        {/* Renta actual */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0f0f1a]">
            {t('rentCalculator.fields.rentaActual')}
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={rentaActual}
              onChange={(e) => setRentaActual(e.target.value)}
              placeholder="900"
              className="w-full rounded-lg border border-[#e8e4dd] bg-white py-2.5 pl-3 pr-10 text-sm text-[#0f0f1a] placeholder-[#b0a898] outline-none transition-colors focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#b0a898]">€/mes</span>
          </div>
        </div>

        {/* Fecha de firma */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#0f0f1a]">
            {t('rentCalculator.fields.fechaFirma')}
          </label>
          <input
            type="month"
            value={fechaFirma ? fechaFirma.substring(0, 7) : ''}
            onChange={(e) => setFechaFirma(e.target.value ? e.target.value + '-01' : '')}
            className="w-full rounded-lg border border-[#e8e4dd] bg-white px-3 py-2.5 text-sm text-[#0f0f1a] outline-none transition-colors focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
          />
          {fecha && (
            <p className="mt-1 text-xs text-[#6b6860]">
              {isAfterLaw
                ? t('rentCalculator.fields.afterLaw')
                : t('rentCalculator.fields.beforeLaw')}
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {hasResult && (
        <div className="mt-6 rounded-xl border border-[#e8e4dd] bg-[#fafaf8] p-5">
          {isAfterLaw && indiceAplicable !== null && rentaNueva !== null && incremento !== null ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b6860]">{t('rentCalculator.results.rentaActual')}</span>
                <span className="font-semibold text-[#0f0f1a]">{fmt(renta)}€/mes</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b6860]">{t('rentCalculator.results.indice')}</span>
                <span className="font-semibold text-[#c9a96e]">+{indiceAplicable}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b6860]">{t('rentCalculator.results.incremento')}</span>
                <span className="font-semibold text-amber-600">+{fmt(incremento)}€/mes</span>
              </div>
              <div className="border-t border-[#e8e4dd] pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0f0f1a]">{t('rentCalculator.results.rentaNueva')}</span>
                <span className="text-lg font-bold text-[#0f0f1a]">{fmt(rentaNueva)}€/mes</span>
              </div>
              <div className="mt-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-center">
                <p className="text-xs font-semibold text-green-700">{t('rentCalculator.results.legal', { pct: indiceAplicable })}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                <p className="text-xs font-semibold text-amber-700">{t('rentCalculator.results.beforeLawNote')}</p>
              </div>
              <p className="text-sm text-[#6b6860]">{t('rentCalculator.results.checkContract')}</p>
            </div>
          )}
        </div>
      )}

      {/* CTAs */}
      <div className="mt-6 space-y-3">
        <Link
          to="/login"
          className="block w-full rounded-lg py-3 text-center text-sm font-bold text-[#0f0f1a] transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)' }}
        >
          {t('rentCalculator.cta')}
        </Link>
        {hasResult && isAfterLaw && (
          <Link
            to="/cartas"
            className="block w-full rounded-lg border border-[#c9a96e]/40 py-2.5 text-center text-sm font-medium text-[#0f0f1a] transition-colors hover:border-[#c9a96e] hover:bg-[#c9a96e]/5"
          >
            {t('rentCalculator.ctaLetter')}
          </Link>
        )}
      </div>
    </div>
  )
}
