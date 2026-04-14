import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Home, Key, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useProfile } from '@/queries/profile'
import { profileKeys } from '@/queries/keys'
import { useOrganization, useUpsertOrganization } from '@/queries/organization'
import { useAuthStore } from '@/store/useAppStore'
import { useToast } from '@/hooks/useToast'
import type { Plan, UserType } from '@/types'

// ── Schema ────────────────────────────────────────────────────────────────────

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
})

type ChangePasswordData = z.infer<typeof changePasswordSchema>

const organizationSchema = z.object({
  name: z.string().min(1),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  contact_email: z.string().email().optional().or(z.literal('')),
})

type OrganizationFormData = z.infer<typeof organizationSchema>

// ── Password strength helpers ─────────────────────────────────────────────────

function getRequirements(t: (k: string) => string) {
  return [
    { key: 'minLength', label: t('login.passwordRequirement.minLength'), test: (p: string) => p.length >= 8 },
    { key: 'uppercase', label: t('login.passwordRequirement.uppercase'), test: (p: string) => /[A-Z]/.test(p) },
    { key: 'number',    label: t('login.passwordRequirement.number'),    test: (p: string) => /[0-9]/.test(p) },
    { key: 'special',   label: t('login.passwordRequirement.special'),   test: (p: string) => /[!@#$%^&*]/.test(p) },
  ]
}

function getStrength(metCount: number): 'weak' | 'medium' | 'strong' {
  if (metCount <= 1) return 'weak'
  if (metCount <= 3) return 'medium'
  return 'strong'
}

const strengthStyle = {
  weak:   { bar: 'bg-red-400',   text: 'text-red-500',   width: 'w-1/4' },
  medium: { bar: 'bg-amber-400', text: 'text-amber-500', width: 'w-2/4' },
  strong: { bar: 'bg-green-500', text: 'text-green-600', width: 'w-full' },
}

// ── Plan display helpers ──────────────────────────────────────────────────────

const planBadgeClass: Record<Plan, string> = {
  none:   'bg-gray-100 text-gray-600',
  single: 'bg-blue-100 text-blue-700',
  pack:   'bg-indigo-100 text-indigo-700',
  pro:    'bg-amber-100 text-amber-800',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function CheckIcon({ met }: { met: boolean }) {
  return met ? (
    <svg className="h-3.5 w-3.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="h-3.5 w-3.5 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

// ── Organization branding section ─────────────────────────────────────────────

function OrganizationSection() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: organization } = useOrganization()
  const upsert = useUpsertOrganization()

  const {
    register: registerOrg,
    handleSubmit: handleOrgSubmit,
    formState: { errors: orgErrors, isSubmitting: orgSubmitting },
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    values: {
      name: organization?.name ?? '',
      primary_color: organization?.primary_color ?? '#1a1a2e',
      contact_email: organization?.contact_email ?? '',
    },
  })

  async function onOrgSubmit(data: OrganizationFormData) {
    try {
      await upsert.mutateAsync({
        name: data.name,
        primary_color: data.primary_color,
        contact_email: data.contact_email || null,
        logo_url: organization?.logo_url ?? null,
      })
      toast.success(t('organization.saveSuccess'))
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  return (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-base font-semibold text-gray-900">{t('organization.sectionTitle')}</h2>
        <span className="inline-flex items-center rounded border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-2 py-0.5 text-xs font-semibold text-[#0f0f1a]">
          Pro
        </span>
      </div>
      <p className="mb-4 text-sm text-gray-500">{t('organization.sectionSubtitle')}</p>

      <form onSubmit={handleOrgSubmit(onOrgSubmit)} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('organization.nameLabel')}</label>
          <input
            {...registerOrg('name')}
            placeholder={t('organization.namePlaceholder')}
            className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10"
          />
          {orgErrors.name && (
            <p className="mt-1 text-xs text-red-600">{t('organization.nameRequired')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('organization.emailLabel')}</label>
          <input
            {...registerOrg('contact_email')}
            type="email"
            placeholder={t('organization.emailPlaceholder')}
            className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm placeholder-gray-400 focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10"
          />
          {orgErrors.contact_email && (
            <p className="mt-1 text-xs text-red-600">{t('organization.emailInvalid')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{t('organization.colorLabel')}</label>
          <div className="mt-1.5 flex items-center gap-3">
            <input
              {...registerOrg('primary_color')}
              type="color"
              className="h-10 w-10 cursor-pointer rounded-lg border border-gray-200 p-1"
            />
            <input
              {...registerOrg('primary_color')}
              type="text"
              placeholder="#1a1a2e"
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-mono placeholder-gray-400 focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">{t('organization.colorHint')}</p>
        </div>

        <button
          type="submit"
          disabled={orgSubmitting}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {orgSubmitting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {t('organization.save')}
        </button>
      </form>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

// ── User type section + modal ─────────────────────────────────────────────────

const USER_TYPE_OPTS: { id: UserType; Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; bgColor: string }[] = [
  { id: 'inquilino',   Icon: Home,      color: '#4CAF50', bgColor: 'rgba(76,175,80,0.08)'  },
  { id: 'propietario', Icon: Key,       color: '#2196F3', bgColor: 'rgba(33,150,243,0.08)' },
  { id: 'profesional', Icon: Building2, color: '#c9a96e', bgColor: 'rgba(201,169,110,0.08)' },
]

function UserTypeSection() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const { data: profile } = useProfile()
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const currentType: UserType = profile?.user_type ?? 'inquilino'
  const currentOpt = USER_TYPE_OPTS.find((o) => o.id === currentType)!

  async function handleSelect(type: UserType) {
    if (!user || type === currentType) { setShowModal(false); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ user_type: type }).eq('id', user.id)
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() })
      setShowModal(false)
      toast.success(t('profile.changeUserTypeSuccess'))
    } catch {
      toast.error(t('profile.changeUserTypeError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{t('profile.userTypeSection')}</h2>
            <p className="mt-0.5 text-sm text-gray-500">{t('profile.userTypeDesc')}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            {t('profile.changeUserType')}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: currentOpt.bgColor }}
          >
            <currentOpt.Icon className="h-5 w-5" style={{ color: currentOpt.color }} />
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {t(`userType.${currentType}.title`)}
          </span>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,15,26,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-semibold text-gray-900">{t('profile.changeUserTypeTitle')}</h2>
            <p className="mb-5 text-sm text-gray-500">{t('profile.changeUserTypeSubtitle')}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {USER_TYPE_OPTS.map((opt) => {
                const isSelected = opt.id === currentType
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={saving}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all disabled:opacity-50 ${
                      isSelected ? 'border-[#1a1a2e]' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={isSelected ? { borderColor: opt.color } : {}}
                  >
                    {isSelected && (
                      <div
                        className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full"
                        style={{ backgroundColor: opt.color }}
                      >
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div
                      className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: opt.bgColor }}
                    >
                      <opt.Icon className="h-4 w-4" style={{ color: opt.color }} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {t(`userType.${opt.id}.title`)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {t(`userType.${opt.id}.description`)}
                    </p>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              {t('monitor.modal.cancel')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const user = useAuthStore((s) => s.user)
  const { data: profile, isLoading, error } = useProfile()

  // ── Change password state ──────────────────────────────────────────────────
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [signingOutAll, setSigningOutAll] = useState(false)

  const requirements = getRequirements(t)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordData>({ resolver: zodResolver(changePasswordSchema) })

  const newPassword = watch('newPassword', '')
  const metRequirements = requirements.map((r) => r.test(newPassword))
  const metCount = metRequirements.filter(Boolean).length
  const allMet = metCount === requirements.length
  const strength = getStrength(metCount)
  const showStrength = newPassword.length > 0

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function onChangePassword(data: ChangePasswordData) {
    setPasswordError(null)
    setConfirmError(null)

    if (!allMet) return

    if (data.newPassword !== confirmPassword) {
      setConfirmError(t('profile.errorPasswordMismatch'))
      return
    }

    // Step 1: verify current password
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: data.currentPassword,
    })
    if (authError) {
      setPasswordError(t('profile.errorCurrentPassword'))
      return
    }

    // Step 2: update to new password
    const { error: updateError } = await supabase.auth.updateUser({ password: data.newPassword })
    if (updateError) {
      setPasswordError(t('profile.errorPasswordGeneric'))
      return
    }

    toast.success(t('profile.changePasswordSuccess'))
    reset()
    setConfirmPassword('')
  }

  async function handleSignOutAll() {
    setSigningOutAll(true)
    await supabase.auth.signOut({ scope: 'global' })
    // onAuthStateChange in the store handles reset() + redirect to /login
  }

  // ── Loading / error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="text-sm text-gray-500">{t('errors.generic')}</p>
      </div>
    )
  }

  // ── Derived display values ────────────────────────────────────────────────

  const initials = user?.email?.charAt(0).toUpperCase() ?? '?'

  const creditsExpiry = profile.credits_expiry
    ? new Date(profile.credits_expiry).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  const memberSince = new Date(profile.created_at).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const showUpgrade = profile.plan !== 'pro'

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">

          {/* Page title */}
          <h1 className="mb-6 text-2xl font-bold text-gray-900">{t('profile.title')}</h1>

          {/* ── Profile header card ───────────────────────────────────────── */}
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e] text-xl font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{user?.email}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${planBadgeClass[profile.plan]}`}>
                    {t(`profile.plan.${profile.plan}`)}
                  </span>
                  <span className="text-xs text-gray-400">{t('profile.memberSince', { date: memberSince })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Plan section ──────────────────────────────────────────────── */}
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">{t('profile.planSection')}</h2>

            <div className="space-y-3">
              {profile.plan === 'pro' && (
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M5 3l14 9-14 9V3z" />
                  </svg>
                  <span className="text-sm text-gray-700">{t('profile.creditsUnlimited')}</span>
                </div>
              )}

              {profile.plan !== 'pro' && profile.plan !== 'none' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{t('profile.creditsLabel')}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {t('profile.creditsRemaining', { count: profile.credits_remaining })}
                    </span>
                  </div>
                  {creditsExpiry && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{t('profile.expiryLabel')}</span>
                      <span className="text-sm text-gray-700">{t('profile.creditsExpiry', { date: creditsExpiry })}</span>
                    </div>
                  )}
                </>
              )}

              {profile.plan === 'none' && (
                <p className="text-sm text-gray-500">{t('profile.creditsNone')}</p>
              )}
            </div>

            {showUpgrade && (
              <div className="mt-5 border-t border-gray-100 pt-4">
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1a2e] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {t('profile.upgradeCta')}
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* ── User type ─────────────────────────────────────────────────── */}
          <UserTypeSection />

          {/* ── Security section ──────────────────────────────────────────── */}
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-gray-900">{t('profile.securitySection')}</h2>

            <form onSubmit={handleSubmit(onChangePassword)} noValidate className="space-y-4">

                {/* Current password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    {t('profile.currentPasswordLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="currentPassword"
                      type={showCurrent ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder={t('profile.currentPasswordPlaceholder')}
                      {...register('currentPassword')}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm placeholder-gray-400 transition-colors focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      aria-label={showCurrent ? t('profile.hidePassword') : t('profile.showPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EyeIcon visible={showCurrent} />
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>
                  )}
                </div>

                {/* New password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    {t('profile.newPasswordLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="newPassword"
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('profile.newPasswordPlaceholder')}
                      {...register('newPassword')}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm placeholder-gray-400 transition-colors focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      aria-label={showNew ? t('profile.hidePassword') : t('profile.showPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EyeIcon visible={showNew} />
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
                  )}

                  {/* Strength indicator */}
                  {showStrength && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 overflow-hidden rounded-full bg-gray-100 h-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${strengthStyle[strength].bar} ${strengthStyle[strength].width}`}
                          />
                        </div>
                        <span className={`text-xs font-medium ${strengthStyle[strength].text}`}>
                          {t(`login.passwordStrength.${strength}`)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {requirements.map((req, i) => (
                          <div key={req.key} className="flex items-center gap-2">
                            <CheckIcon met={metRequirements[i]} />
                            <span className={`text-xs transition-colors ${metRequirements[i] ? 'text-green-600' : 'text-gray-400'}`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm new password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t('profile.confirmPasswordLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('profile.confirmPasswordPlaceholder')}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (confirmError) setConfirmError(null)
                      }}
                      className={[
                        'block w-full rounded-xl border bg-gray-50 px-3.5 py-2.5 pr-10 text-sm placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 disabled:opacity-50',
                        confirmError
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                          : 'border-gray-200 focus:border-[#1a1a2e] focus:bg-white focus:ring-[#1a1a2e]/10',
                      ].join(' ')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? t('profile.hidePassword') : t('profile.showPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EyeIcon visible={showConfirm} />
                    </button>
                  </div>
                  {confirmError && (
                    <p className="mt-1 text-xs text-red-600">{confirmError}</p>
                  )}
                </div>

                {/* Error */}
                {passwordError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !allMet}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {t('profile.changePasswordSubmit')}
                </button>
              </form>
          </div>

          {/* ── Organization branding (Pro only) ─────────────────────────── */}
          {profile.plan === 'pro' && <OrganizationSection />}

          {/* ── Danger zone ───────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-1 text-base font-semibold text-red-600">{t('profile.dangerSection')}</h2>
            <p className="mb-4 text-sm text-gray-500">{t('profile.signOutAllDesc')}</p>
            <button
              type="button"
              onClick={handleSignOutAll}
              disabled={signingOutAll}
              className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              {signingOutAll && (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
              )}
              {t('profile.signOutAllButton')}
            </button>
          </div>

        </div>
    </div>
  )
}
