import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.string().email(),
})

type FormData = z.infer<typeof schema>

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ForgotPassword() {
  const { t } = useTranslation()
  const emailRef = useRef<HTMLInputElement | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  async function onSubmit(data: FormData) {
    setServerError(null)
    const appUrl = import.meta.env.VITE_APP_URL as string
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${appUrl}/reset-password`,
    })
    if (error) {
      setServerError(t('forgotPassword.errorGeneric'))
    } else {
      setSuccessEmail(data.email)
    }
  }

  const { ref: rhfEmailRef, ...emailRegister } = register('email')

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
          <p className="mt-3 text-sm text-white/50">{t('forgotPassword.titleSub')}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">

          {/* Card header */}
          <div className="border-b border-gray-100 px-8 pt-7 pb-5">
            <h1 className="text-xl font-bold text-gray-900">{t('forgotPassword.title')}</h1>
          </div>

          <div className="px-8 py-6">
            {successEmail ? (
              // ── Success state ──────────────────────────────────────────────
              <div className="py-2 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">{t('forgotPassword.success')}</h2>
                <p className="mt-2 text-sm text-gray-500">
                  {t('forgotPassword.successSub', { email: successEmail })}
                </p>
              </div>
            ) : (
              // ── Form ──────────────────────────────────────────────────────
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('forgotPassword.emailLabel')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('forgotPassword.emailPlaceholder')}
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

                {serverError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{serverError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {t('forgotPassword.submit')}
                </button>
              </form>
            )}
          </div>

          {/* Card footer */}
          <div className="border-t border-gray-100 px-8 py-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('forgotPassword.backToLogin')}
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          {t('footer.disclaimer')}
        </p>
      </div>
    </div>
  )
}
