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
  strong: { bar: 'bg-[#14532d]', text: 'text-[#14532d]', width: 'w-full' },
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
    <svg className="h-3.5 w-3.5 shrink-0 text-[#14532d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="h-3.5 w-3.5 shrink-0 text-[#e8e4dd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
  )
}

// ── Left branding panel ───────────────────────────────────────────────────────

function BrandPanel() {
  const { t } = useTranslation()
  return (
    <div className="relative hidden md:flex md:w-[420px] lg:w-[480px] shrink-0 flex-col justify-between bg-[#0f0f1a] px-10 py-12 lg:px-12">
      {/* Vertical lines pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 60px)',
        }}
      />

      {/* Logo */}
      <Link to="/" className="relative flex items-center gap-2.5">
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m-5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 018.618 3.04A12.02 12.02 0 0121 9c0 5.591-3.824 10.29-9 11.622-5.176-1.332-9-6.03-9-11.622 0-1.042.133-2.052.382-3.016z" />
        </svg>
        <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="text-white">Clausula</span>
          <span style={{ color: '#c9a96e' }}>AI</span>
        </span>
      </Link>

      {/* Quote */}
      <div className="relative">
        <div className="mb-4 text-5xl font-bold leading-none" style={{ color: '#c9a96e', opacity: 0.4 }}>"</div>
        <blockquote
          className="text-2xl font-bold leading-snug text-white lg:text-[26px]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t('login.brandPanel.quote')}
        </blockquote>
        <p className="mt-4 text-sm" style={{ color: '#c9a96e', opacity: 0.7 }}>
          {t('login.brandPanel.attribution')}
        </p>
      </div>

      {/* Trust signals */}
      <div className="relative space-y-3">
        {[
          {
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m-5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 018.618 3.04A12.02 12.02 0 0121 9c0 5.591-3.824 10.29-9 11.622-5.176-1.332-9-6.03-9-11.622 0-1.042.133-2.052.382-3.016z" />
            ),
            label: t('login.brandPanel.trust1'),
          },
          {
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            ),
            label: t('login.brandPanel.trust2'),
          },
          {
            icon: (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            ),
            label: t('login.brandPanel.trust3'),
          },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                 style={{ color: '#c9a96e' }}>
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [serverError, setServerError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState<string | null>(null)

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

  useEffect(() => {
    const flashKey = sessionStorage.getItem('auth_flash')
    if (flashKey) {
      sessionStorage.removeItem('auth_flash')
      setServerError(t(flashKey))
    }
  }, [t])

  useEffect(() => {
    emailRef.current?.focus()
  }, [mode])

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

  // ── Check email confirmation screen ──────────────────────────────────────

  if (checkEmail) {
    return (
      <div className="flex min-h-screen">
        <BrandPanel />
        <div className="flex flex-1 items-center justify-center bg-[#fafaf8] px-4 py-12">
          <div className="w-full max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a96e]/15">
              <svg className="h-7 w-7 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0f0f1a]">{t('login.checkEmail')}</h2>
            <p className="mt-2 text-sm text-[#6b6860]">{t('login.checkEmailSub')}</p>
            <button
              onClick={toggleMode}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#c9a96e] hover:opacity-80 transition-opacity"
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

  // ── Email ref callback ────────────────────────────────────────────────────

  const { ref: rhfEmailRef, ...emailRegister } = register('email')

  const isRegisterDisabled = isSubmitting || (mode === 'register' && !allMet)

  // ── Main form — split panel ───────────────────────────────────────────────

  return (
    <div className="flex min-h-screen">
      {/* Left: branding panel (desktop only) */}
      <BrandPanel />

      {/* Right: form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#fafaf8] px-4 py-12 sm:px-8">

        {/* Desktop logo — shown on right panel */}
        <div className="mb-8 hidden w-full max-w-[360px] md:block">
          <Link to="/" className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#0f0f1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m-5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 018.618 3.04A12.02 12.02 0 0121 9c0 5.591-3.824 10.29-9 11.622-5.176-1.332-9-6.03-9-11.622 0-1.042.133-2.052.382-3.016z" />
            </svg>
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              <span className="text-[#0f0f1a]">Clausula</span>
              <span style={{ color: '#c9a96e' }}>AI</span>
            </span>
          </Link>
        </div>

        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center md:hidden">
          <Link to="/" className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#0f0f1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m-5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 018.618 3.04A12.02 12.02 0 0121 9c0 5.591-3.824 10.29-9 11.622-5.176-1.332-9-6.03-9-11.622 0-1.042.133-2.052.382-3.016z" />
            </svg>
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              <span className="text-[#0f0f1a]">Clausula</span>
              <span style={{ color: '#c9a96e' }}>AI</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-[#6b6860]">
            {mode === 'login' ? t('login.titleSub') : t('login.registerTitleSub')}
          </p>
        </div>

        {/* Form card */}
        <div className="w-full max-w-[360px]">

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#0f0f1a]">
              {mode === 'login' ? t('login.title') : t('login.registerTitle')}
            </h1>
            <p className="mt-1 hidden text-sm text-[#6b6860] md:block">
              {mode === 'login' ? t('login.titleSub') : t('login.registerTitleSub')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0f0f1a]">
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
                className="mt-1.5 block w-full rounded-md border border-[#e8e4dd] bg-white px-3.5 py-2.5 text-sm text-[#0f0f1a] placeholder-[#6b6860]/50 transition-colors focus:border-[#c9a96e] focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 disabled:opacity-50"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0f0f1a]">
                {t('login.passwordLabel')}
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder={t('login.passwordPlaceholder')}
                  {...register('password')}
                  className="block w-full rounded-md border border-[#e8e4dd] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0f0f1a] placeholder-[#6b6860]/50 transition-colors focus:border-[#c9a96e] focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6860] hover:text-[#0f0f1a] transition-colors"
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
                    <div className="flex-1 overflow-hidden rounded-full bg-[#e8e4dd] h-1.5">
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
                        <span className={`text-xs transition-colors ${metRequirements[i] ? 'text-[#14532d]' : 'text-[#6b6860]'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Forgot password */}
            {mode === 'login' && (
              <div className="flex justify-end -mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: '#c9a96e' }}
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>
            )}

            {/* Confirm password */}
            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0f0f1a]">
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
                      'block w-full rounded-md border bg-white px-3.5 py-2.5 pr-10 text-sm text-[#0f0f1a] placeholder-[#6b6860]/50 transition-colors focus:outline-none focus:ring-2 disabled:opacity-50',
                      confirmError
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                        : 'border-[#e8e4dd] focus:border-[#c9a96e] focus:ring-[#c9a96e]/20',
                    ].join(' ')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? t('login.hidePassword') : t('login.showPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6860] hover:text-[#0f0f1a] transition-colors"
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
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-3">
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
              className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-px focus:outline-none disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)', color: '#0f0f1a' }}
            >
              {isSubmitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0f0f1a]/30 border-t-[#0f0f1a]" />
              )}
              {mode === 'login' ? t('login.submitLogin') : t('login.submitRegister')}
            </button>
          </form>

          {/* Mode toggle */}
          <p className="mt-6 text-center text-sm text-[#6b6860]">
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium transition-opacity hover:opacity-70"
              style={{ color: '#c9a96e' }}
            >
              {mode === 'login' ? t('login.switchToRegister') : t('login.switchToLogin')}
            </button>
          </p>

          {/* Legal disclaimer */}
          <p className="mt-8 text-center text-xs text-[#6b6860]/50">
            {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  )
}
