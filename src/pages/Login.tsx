import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/useAppStore'

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type AuthFormData = z.infer<typeof authSchema>

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [serverError, setServerError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, isLoading, navigate])

  async function onSubmit(data: AuthFormData) {
    setServerError(null)
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
      } else if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already been registered')) {
        setServerError(t('login.errorEmailInUse'))
      } else {
        setServerError(message)
      }
    }
  }

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setServerError(null)
    setCheckEmail(false)
  }

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{t('login.checkEmail')}</h2>
          <button
            onClick={toggleMode}
            className="mt-6 text-sm text-indigo-600 hover:text-indigo-500"
          >
            {t('login.switchToLogin')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            ClausulaAI
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">
            {mode === 'login' ? t('login.title') : t('login.registerTitle')}
          </h1>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {/* Email + Password form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('login.emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t('login.emailPlaceholder')}
                {...register('email')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('login.passwordLabel')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder={t('login.passwordPlaceholder')}
                {...register('password')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting
                ? '…'
                : mode === 'login'
                  ? t('login.submitLogin')
                  : t('login.submitRegister')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {mode === 'login' ? t('login.switchToRegister') : t('login.switchToLogin')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
