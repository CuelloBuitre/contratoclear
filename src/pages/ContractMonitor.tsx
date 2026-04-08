import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useProfile } from '@/queries/profile'
import { useContracts, useAddContract, useUpdateContract, useDeleteContract } from '@/queries/contracts'
import AddContractModal from '@/components/monitor/AddContractModal'
import type { Contract } from '@/types'
import type { ContractFormData } from '@/components/monitor/AddContractModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAYS_UNTIL_EXPIRING = 90

function daysUntilEnd(contract_end: string | null): number | null {
  if (!contract_end) return null
  const end = new Date(contract_end)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function isExpiringSoon(contract: Contract): boolean {
  const days = daysUntilEnd(contract.contract_end)
  return days !== null && days >= 0 && days <= DAYS_UNTIL_EXPIRING
}

function isExpired(contract: Contract): boolean {
  const days = daysUntilEnd(contract.contract_end)
  return days !== null && days < 0
}

function needsDepositReturn(contract: Contract): boolean {
  return isExpired(contract) && !contract.deposit_returned
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

// ── Alert badge ───────────────────────────────────────────────────────────────

function AlertBadge({ contract }: { contract: Contract }) {
  const { t } = useTranslation()
  const days = daysUntilEnd(contract.contract_end)

  if (needsDepositReturn(contract)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {t('monitor.alert.depositDue')}
      </span>
    )
  }

  if (isExpired(contract)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        {t('monitor.alert.expired')}
      </span>
    )
  }

  if (isExpiringSoon(contract) && days !== null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {t('monitor.alert.expiringSoon', { days })}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      {t('monitor.alert.active')}
    </span>
  )
}

// ── Contract card ─────────────────────────────────────────────────────────────

interface ContractCardProps {
  contract: Contract
  onEdit: (contract: Contract) => void
  onDelete: (id: string) => void
  onToggleDeposit: (id: string, returned: boolean) => void
}

function ContractCard({ contract, onEdit, onDelete, onToggleDeposit }: ContractCardProps) {
  const { t } = useTranslation()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const expired = isExpired(contract)
  const depositDue = needsDepositReturn(contract)

  return (
    <div
      className={`rounded-xl border bg-white p-5 transition-shadow hover:shadow-md ${
        depositDue
          ? 'border-red-200'
          : expired
          ? 'border-[#e8e4dd]'
          : 'border-[#e8e4dd]'
      }`}
      style={{ boxShadow: depositDue ? '0 0 0 1px #fee2e2' : undefined }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#0f0f1a] truncate">{contract.tenant_name}</p>
          <p className="mt-0.5 text-sm text-[#6b6860] truncate">{contract.property_address}</p>
        </div>
        <AlertBadge contract={contract} />
      </div>

      {/* Details grid */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-[#9ca3af]">{t('monitor.card.rent')}</p>
          <p className="font-medium text-[#0f0f1a]">{formatCurrency(contract.rent_amount)}/mes</p>
        </div>
        <div>
          <p className="text-xs text-[#9ca3af]">{t('monitor.card.deposit')}</p>
          <p className="font-medium text-[#0f0f1a]">{formatCurrency(contract.deposit_amount)}</p>
        </div>
        <div>
          <p className="text-xs text-[#9ca3af]">{t('monitor.card.start')}</p>
          <p className="font-medium text-[#0f0f1a]">{formatDate(contract.contract_start)}</p>
        </div>
        <div>
          <p className="text-xs text-[#9ca3af]">{t('monitor.card.end')}</p>
          <p className={`font-medium ${expired ? 'text-red-600' : 'text-[#0f0f1a]'}`}>
            {formatDate(contract.contract_end)}
          </p>
        </div>
      </div>

      {/* Notes */}
      {contract.notes && (
        <p className="mt-3 text-xs text-[#6b6860] line-clamp-2">{contract.notes}</p>
      )}

      {/* Deposit return toggle */}
      {(isExpired(contract) || contract.deposit_returned) && (
        <label className="mt-3 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={contract.deposit_returned}
            onChange={(e) => onToggleDeposit(contract.id, e.target.checked)}
            className="h-4 w-4 rounded border-[#e8e4dd] text-[#1a1a2e] focus:ring-[#1a1a2e]/20"
          />
          <span className="text-xs text-[#6b6860]">{t('monitor.card.depositReturned')}</span>
        </label>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t border-[#f3f0ea] pt-3">
        <button
          type="button"
          onClick={() => onEdit(contract)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#6b6860] transition-colors hover:bg-[#fafaf8] hover:text-[#0f0f1a]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t('monitor.card.edit')}
        </button>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#6b6860] transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('monitor.card.delete')}
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-red-600">{t('monitor.card.confirmDelete')}</span>
            <button
              type="button"
              onClick={() => onDelete(contract.id)}
              className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
            >
              {t('monitor.card.deleteConfirm')}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-[#e8e4dd] px-2.5 py-1 text-xs font-medium text-[#6b6860] transition-colors hover:bg-[#fafaf8]"
            >
              {t('monitor.card.deleteCancel')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContractMonitor() {
  const { t } = useTranslation()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: contracts = [], isLoading: contractsLoading } = useContracts()
  const addContract = useAddContract()
  const updateContract = useUpdateContract()
  const deleteContract = useDeleteContract()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | undefined>(undefined)

  // ── Pro gate ───────────────────────────────────────────────────────────────

  if (profileLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" />
      </div>
    )
  }

  if (profile?.plan !== 'pro') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a96e]/10">
          <svg className="h-7 w-7 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-[#0f0f1a]">{t('monitor.proGate.title')}</h2>
        <p className="mt-1 max-w-sm text-sm text-[#6b6860]">{t('monitor.proGate.subtitle')}</p>
        <Link
          to="/pricing"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t('monitor.proGate.cta')}
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    )
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  const activeCount = contracts.filter((c) => !isExpired(c)).length
  const expiringSoonCount = contracts.filter(isExpiringSoon).length
  const depositDueCount = contracts.filter(needsDepositReturn).length

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleSubmit(data: ContractFormData) {
    const payload = {
      ...data,
      contract_end: data.contract_end || null,
      notes: data.notes || null,
    }

    if (editingContract) {
      await updateContract.mutateAsync({ id: editingContract.id, ...payload })
    } else {
      await addContract.mutateAsync(payload)
    }
    setModalOpen(false)
    setEditingContract(undefined)
  }

  function handleEdit(contract: Contract) {
    setEditingContract(contract)
    setModalOpen(true)
  }

  function handleAdd() {
    setEditingContract(undefined)
    setModalOpen(true)
  }

  function handleDelete(id: string) {
    deleteContract.mutate(id)
  }

  function handleToggleDeposit(id: string, returned: boolean) {
    updateContract.mutate({ id, deposit_returned: returned })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0f0f1a]">{t('monitor.title')}</h1>
            <p className="mt-0.5 text-sm text-[#6b6860]">{t('monitor.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a1a2e] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('monitor.addContract')}
          </button>
        </div>

        {/* Stats bar */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#e8e4dd] bg-white p-4 text-center">
            <p className="text-2xl font-bold text-[#0f0f1a]">{activeCount}</p>
            <p className="mt-0.5 text-xs text-[#6b6860]">{t('monitor.stats.active')}</p>
          </div>
          <div className={`rounded-xl border p-4 text-center ${
            expiringSoonCount > 0 ? 'border-amber-200 bg-amber-50' : 'border-[#e8e4dd] bg-white'
          }`}>
            <p className={`text-2xl font-bold ${expiringSoonCount > 0 ? 'text-amber-700' : 'text-[#0f0f1a]'}`}>
              {expiringSoonCount}
            </p>
            <p className="mt-0.5 text-xs text-[#6b6860]">{t('monitor.stats.expiringSoon')}</p>
          </div>
          <div className={`rounded-xl border p-4 text-center ${
            depositDueCount > 0 ? 'border-red-200 bg-red-50' : 'border-[#e8e4dd] bg-white'
          }`}>
            <p className={`text-2xl font-bold ${depositDueCount > 0 ? 'text-red-600' : 'text-[#0f0f1a]'}`}>
              {depositDueCount}
            </p>
            <p className="mt-0.5 text-xs text-[#6b6860]">{t('monitor.stats.depositsDue')}</p>
          </div>
        </div>

        {/* Contracts list */}
        {contractsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8e4dd] py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fafaf8]">
              <svg className="h-6 w-6 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-[#0f0f1a]">{t('monitor.empty.title')}</p>
            <p className="mt-1 max-w-xs text-sm text-[#6b6860]">{t('monitor.empty.subtitle')}</p>
            <button
              type="button"
              onClick={handleAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e8e4dd] bg-white px-4 py-2.5 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('monitor.empty.cta')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleDeposit={handleToggleDeposit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <AddContractModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingContract(undefined)
        }}
        onSubmit={handleSubmit}
        initialValues={editingContract}
        isSubmitting={addContract.isPending || updateContract.isPending}
      />
    </div>
  )
}
