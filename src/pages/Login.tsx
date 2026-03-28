import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAppStore'

// ── Schema ────────────────────────────────────────────────────────────────────

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type AuthFormData = z.infer<typeof authSchema>

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

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [serverError, setServerError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const emailRef = useRef<HTMLInputElement | null>(null)

  const requirements = getRequirements(t)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const password = watch('password', '')
  const metRequirements = requirements.map((r) => r.test(password))
  const metCount = metRequirements.filter(Boolean).length
  const allMet = metCount === requirements.length
  const strength = getStrength(metCount)
  const showStrength = mode === 'register' && password.length > 0

  // Auto-focus email on mount and mode change
  useEffect(() => {
    emailRef.current?.focus()
  }, [mode])

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, isLoading, navigate])

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setServerError(null)
    setConfirmError(null)
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirm(false)
    reset()
  }

  async function onSubmit(data: AuthFormData) {
    setServerError(null)
    setConfirmError(null)

    // Register-specific validation
    if (mode === 'register') {
      if (!allMet) return
      if (data.password !== confirmPassword) {
        setConfirmError(t('login.errorPasswordMismatch'))
        return
      }
    }

    try {
      if (mode === 'login') {
        await signIn(data.email, data.password)
        navigate('/dashboard', { replace: true })
      } else {
        const result = await signUp(data.email, data.password)
        if (result.session) {
          navigate('/dashboard', { replace: true })
        } else {
          setCheckEmail(true)
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errors.generic')
      if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('credentials')) {
        setServerError(t('login.errorInvalidCredentials'))
      } else if (
        message.toLowerCase().includes('already registered') ||
        message.toLowerCase().includes('already been registered')
      ) {
        setServerError(t('login.errorEmailInUse'))
      } else {
        setServerError(message)
      }
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      setServerError(t('errors.generic'))
      setGoogleLoading(false)
    }
  }

  // ── Check email confirmation screen ──────────────────────────────────────

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a2e] px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('login.checkEmail')}</h2>
            <p className="mt-2 text-sm text-gray-500">{t('login.checkEmailSub')}</p>
            <button
              onClick={toggleMode}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('login.backToLogin')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Email ref callback (merges RHF ref with local ref) ────────────────────

  const { ref: rhfEmailRef, ...emailRegister } = register('email')

  const isRegisterDisabled = isSubmitting || (mode === 'register' && !allMet)

  // ── Main form ─────────────────────────────────────────────────────────────

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
          <p className="mt-3 text-sm text-white/50">
            {mode === 'login' ? t('login.titleSub') : t('login.registerTitleSub')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">

          {/* Card header */}
          <div className="border-b border-gray-100 px-8 pt-7 pb-5">
            <h1 className="text-xl font-bold text-gray-900">
              {mode === 'login' ? t('login.title') : t('login.registerTitle')}
            </h1>
          </div>

          {/* Form body */}
          <div className="px-8 py-6">

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || isSubmitting}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {googleLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {t('login.continueWithGoogle')}
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">{t('login.separator')}</span>
              </div>
            </div>

            {/* Email/password form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('login.emailLabel')}
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('login.emailPlaceholder')}
                  {...emailRegister}
                  ref={(el) => {
                    rhfEmailRef(el)
                    emailRef.current = el
                  }}
                  className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-[#1a1a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/10 disabled:opacity-50"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('login.passwordLabel')}
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder={t('login.passwordPlaceholder')}
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

                {/* Strength bar + requirements (register only) */}
                {showStrength && (
                  <div className="mt-3 space-y-2">
                    {/* Bar */}
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

                    {/* Requirements checklist */}
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

              {/* Confirm password (register only) */}
              {mode === 'register' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t('login.confirmPasswordLabel')}
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder={t('login.confirmPasswordPlaceholder')}
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
              )}

              {/* Server error */}
              {serverError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{serverError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isRegisterDisabled}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {mode === 'login' ? t('login.submitLogin') : t('login.submitRegister')}
              </button>
            </form>
          </div>

          {/* Card footer — mode toggle */}
          <div className="border-t border-gray-100 px-8 py-4 text-center">
            <p className="text-sm text-gray-500">
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                {mode === 'login' ? t('login.switchToRegister') : t('login.switchToLogin')}
              </button>
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="mt-6 text-center text-xs text-white/30">
          {t('footer.disclaimer')}
        </p>
      </div>
    </div>
  )
}
