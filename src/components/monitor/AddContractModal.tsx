import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import type { Contract } from '@/types'

// ── Schema ────────────────────────────────────────────────────────────────────

const contractSchema = z.object({
  tenant_name: z.string().min(1),
  property_address: z.string().min(1),
  rent_amount: z.coerce.number().positive(),
  contract_start: z.string().min(1),
  contract_end: z.string().optional(),
  deposit_amount: z.coerce.number().min(0),
  deposit_returned: z.boolean(),
  notes: z.string().optional(),
})

export type ContractFormData = z.infer<typeof contractSchema>

// ── Component ─────────────────────────────────────────────────────────────────

interface AddContractModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ContractFormData) => Promise<void>
  initialValues?: Partial<Contract>
  isSubmitting?: boolean
}

export default function AddContractModal({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting,
}: AddContractModalProps) {
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      deposit_returned: false,
    },
  })

  const startDate = useWatch({
    control,
    name: 'contract_start',
  })

  useEffect(() => {
    if (open && initialValues) {
      reset({
        tenant_name: initialValues.tenant_name ?? '',
        property_address: initialValues.property_address ?? '',
        rent_amount: initialValues.rent_amount ?? undefined,
        contract_start: initialValues.contract_start ?? '',
        contract_end: initialValues.contract_end ?? '',
        deposit_amount: initialValues.deposit_amount ?? 0,
        deposit_returned: initialValues.deposit_returned ?? false,
        notes: initialValues.notes ?? '',
      })
    } else if (open && !initialValues) {
      reset({ deposit_returned: false })
    }
  }, [open, initialValues, reset])

  // Auto-suggest end_date as start_date + 5 years
  useEffect(() => {
    if (startDate && !initialValues?.contract_end) {
      const start = new Date(startDate)
      const end = new Date(start.getFullYear() + 5, start.getMonth(), start.getDate())
      const endFormatted = end.toISOString().split('T')[0]
      setValue('contract_end', endFormatted)
    }
  }, [startDate, setValue, initialValues?.contract_end])

  if (!open) return null

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  // Calculate min date for end_date (start_date + 1 day)
  const getMinEndDate = () => {
    if (!startDate) return today
    const start = new Date(startDate)
    const next = new Date(start.getTime() + 24 * 60 * 60 * 1000)
    return next.toISOString().split('T')[0]
  }

  async function handleFormSubmit(data: ContractFormData) {
    await onSubmit(data)
    reset({ deposit_returned: false })
  }

  const isEdit = !!initialValues?.id

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0f0f1a]">
            {isEdit ? t('monitor.modal.titleEdit') : t('monitor.modal.titleAdd')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#6b6860] transition-colors hover:text-[#0f0f1a]"
            aria-label={t('monitor.modal.close')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">

          {/* Tenant name */}
          <div>
            <label className="block text-xs font-medium text-[#6b6860]">
              {t('monitor.modal.tenantName')} *
            </label>
            <input
              {...register('tenant_name')}
              placeholder={t('monitor.modal.tenantNamePlaceholder')}
              className="mt-1 block w-full rounded-xl border border-[#e8e4dd] bg-[#fafaf8] px-3.5 py-2.5 text-sm placeholder-[#9ca3af] focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10"
            />
            {errors.tenant_name && (
              <p className="mt-1 text-xs text-red-600">{t('monitor.modal.required')}</p>
            )}
          </div>

          {/* Property address */}
          <div>
            <label className="block text-xs font-medium text-[#6b6860]">
              {t('monitor.modal.address')} *
            </label>
            <input
              {...register('property_address')}
              placeholder={t('monitor.modal.addressPlaceholder')}
              className="mt-1 block w-full rounded-xl border border-[#e8e4dd] bg-[#fafaf8] px-3.5 py-2.5 text-sm placeholder-[#9ca3af] focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10"
            />
            {errors.property_address && (
              <p className="mt-1 text-xs text-red-600">{t('monitor.modal.required')}</p>
            )}
          </div>

          {/* Rent + deposit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6b6860]">
                {t('monitor.modal.rentAmount')} *
              </label>
              <div className="relative mt-1">
                <input
                  {...register('rent_amount')}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="800"
                  className="block w-full rounded-xl border border-[#e8e4dd] bg-[#fafaf8] py-2.5 pl-3.5 pr-8 text-sm placeholder-[#9ca3af] focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]">€</span>
              </div>
              {errors.rent_amount && (
                <p className="mt-1 text-xs text-red-600">{t('monitor.modal.required')}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b6860]">
                {t('monitor.modal.depositAmount')}
              </label>
              <div className="relative mt-1">
                <input
                  {...register('deposit_amount')}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="800"
                  className="block w-full rounded-xl border border-[#e8e4dd] bg-[#fafaf8] py-2.5 pl-3.5 pr-8 text-sm placeholder-[#9ca3af] focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9ca3af]">€</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6b6860]">
                {t('monitor.modal.startDate')} *
              </label>
              <input
                {...register('contract_start')}
                type="date"
                min={today}
                className="mt-1 block w-full rounded-[6px] border border-[#e8e4dd] bg-[#fafaf8] px-3.5 py-2.5 text-sm focus:border-[#c9a96e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/30"
              />
              {errors.contract_start && (
                <p className="mt-1 text-xs text-red-600">{t('monitor.modal.required')}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b6860]">
                {t('monitor.modal.endDate')}
              </label>
              <input
                {...register('contract_end')}
                type="date"
                min={getMinEndDate()}
                className="mt-1 block w-full rounded-[6px] border border-[#e8e4dd] bg-[#fafaf8] px-3.5 py-2.5 text-sm focus:border-[#c9a96e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/30"
              />
            </div>
          </div>

          {/* Deposit returned */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register('deposit_returned')}
              type="checkbox"
              className="h-4 w-4 rounded border-[#e8e4dd] text-[#1a1a2e] focus:ring-[#1a1a2e]/20"
            />
            <span className="text-sm text-[#374151]">{t('monitor.modal.depositReturned')}</span>
          </label>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#6b6860]">
              {t('monitor.modal.notes')}
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder={t('monitor.modal.notesPlaceholder')}
              className="mt-1 block w-full resize-none rounded-xl border border-[#e8e4dd] bg-[#fafaf8] px-3.5 py-2.5 text-sm placeholder-[#9ca3af] focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#e8e4dd] py-2.5 text-sm font-medium text-[#6b6860] transition-colors hover:bg-[#fafaf8]"
            >
              {t('monitor.modal.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isEdit ? t('monitor.modal.saveEdit') : t('monitor.modal.save')}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
