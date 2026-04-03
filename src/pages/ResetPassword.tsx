import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

// ── Password strength helpers (same as register form) ─────────────────────────

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

export default function ResetPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const requirements = getRequirements(t)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const password = watch('password', '')
  const metRequirements = requirements.map((r) => r.test(password))
  const metCount = metRequirements.filter(Boolean).length
  const allMet = metCount === requirements.length
  const strength = getStrength(metCount)
  const showStrength = password.length > 0

  // Redirect to dashboard after successful password update
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 2000)
    return () => clearTimeout(timer)
  }, [success, navigate])

  async function onSubmit(data: FormData) {
    setServerError(null)
    setConfirmError(null)

    if (!allMet) return

    if (data.password !== confirmPassword) {
      setConfirmError(t('resetPassword.errorMismatch'))
      return
    }

    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')) {
        setServerError(t('resetPassword.errorExpired'))
      } else {
        setServerError(t('resetPassword.errorGeneric'))
      }
      return
    }

    setSuccess(true)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#1a1a2e] px-4 py-12">
      {/* Background grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 group-hover:bg-white/15 transition-colors">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-white">ClausulaAI</span>
          </Link>
          <p className="mt-3 text-sm text-white/50">{t('resetPassword.titleSub')}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">

          {/* Card header */}
          <div className="border-b border-gray-100 px-8 pt-7 pb-5">
            <h1 className="text-xl font-bold text-gray-900">{t('resetPassword.title')}</h1>
          </div>

          <div className="px-8 py-6">
            {success ? (
              // ── Success state ──────────────────────────────────────────────
              <div className="py-2 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">{t('resetPassword.success')}</h2>
                <p className="mt-2 text-sm text-gray-500">{t('resetPassword.successSub')}</p>
                <div className="mt-4 flex justify-center">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1a2e]/30 border-t-[#1a1a2e]" />
                </div>
              </div>
            ) : (
              // ── Form ──────────────────────────────────────────────────────
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

                {/* New password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('resetPassword.newPasswordLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('resetPassword.newPasswordPlaceholder')}
                      {...register('password')}
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm placeholder-gray-400 transition-colors focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                  )}

                  {/* Strength bar + requirements */}
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

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t('resetPassword.confirmPasswordLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('resetPassword.confirmPasswordPlaceholder')}
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
                      aria-label={showConfirm ? t('login.hidePassword') : t('login.showPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EyeIcon visible={showConfirm} />
                    </button>
                  </div>
                  {confirmError && (
                    <p className="mt-1 text-xs text-red-600">{confirmError}</p>
                  )}
                </div>

                {/* Server error */}
                {serverError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-red-700">{serverError}</p>
                      {serverError === t('resetPassword.errorExpired') && (
                        <Link
                          to="/forgot-password"
                          className="mt-1 inline-block text-xs font-semibold text-red-700 underline hover:no-underline"
                        >
                          {t('resetPassword.backToForgot')}
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !allMet}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {t('resetPassword.submit')}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          {t('footer.disclaimer')}
        </p>
      </div>
    </div>
  )
}
