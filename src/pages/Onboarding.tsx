import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Building2, Home, Key } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAppStore'
import type { UserType } from '@/types'

const userTypeOptions: Array<{
  id: UserType
  icon: React.ReactNode
  color: string
  borderColor: string
  bgColor: string
}> = [
  {
    id: 'inquilino',
    icon: <Home className="h-10 w-10" />,
    color: '#4CAF50',
    borderColor: '#4CAF50',
    bgColor: 'rgba(76, 175, 80, 0.08)',
  },
  {
    id: 'propietario',
    icon: <Key className="h-10 w-10" />,
    color: '#2196F3',
    borderColor: '#2196F3',
    bgColor: 'rgba(33, 150, 243, 0.08)',
  },
  {
    id: 'profesional',
    icon: <Building2 className="h-10 w-10" />,
    color: '#c9a96e',
    borderColor: '#c9a96e',
    bgColor: 'rgba(201, 169, 110, 0.08)',
  },
]

export default function Onboarding() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [selected, setSelected] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (!selected || !user) return

    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          user_type: selected,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSkip() {
    if (!user) return
    navigate('/dashboard')
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#1a1a2e' }}
    >
      {/* Logo */}
      <div className="mb-12 flex items-center gap-2">
        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m-5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 018.618 3.04A12.02 12.02 0 0121 9c0 5.591-3.824 10.29-9 11.622-5.176-1.332-9-6.03-9-11.622 0-1.042.133-2.052.382-3.016z"
          />
        </svg>
        <span className="text-xl font-semibold text-white">
          Clausula<span style={{ color: '#c9a96e' }}>AI</span>
        </span>
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl">
        {/* Headline */}
        <h1
          className="text-center text-4xl font-semibold text-white leading-tight mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t('onboarding.headline')}
        </h1>
        <p className="text-center text-lg text-white/70 mb-12">
          {t('onboarding.subtitle')}
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-8 rounded-lg border border-red-400 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3 mb-8">
          {userTypeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelected(option.id)}
              className={`relative rounded-lg border-2 p-6 text-left transition-all duration-200 ${
                selected === option.id
                  ? 'border-white/40 shadow-lg'
                  : 'border-white/20 hover:border-white/30'
              }`}
              style={{
                backgroundColor: option.bgColor,
                borderColor: selected === option.id ? option.color : 'rgba(255, 255, 255, 0.2)',
              }}
            >
              {/* Selection indicator */}
              {selected === option.id && (
                <div
                  className="absolute top-3 right-3 h-5 w-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: option.color }}
                >
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: option.color }} />
                </div>
              )}

              {/* Icon */}
              <div className="mb-4" style={{ color: option.color }}>
                {option.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {t(`userType.${option.id}.title`)}
              </h3>

              {/* Description */}
              <p className="text-sm text-white/70 mb-4">
                {t(`userType.${option.id}.description`)}
              </p>

              {/* Highlights */}
              <ul className="space-y-1.5 text-xs text-white/60">
                {(t(`userType.${option.id}.highlights`, { returnObjects: true }) as string[]).map(
                  (highlight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }} />
                      <span>{highlight}</span>
                    </li>
                  ),
                )}
              </ul>
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleContinue}
            disabled={!selected || isLoading}
            className="rounded-lg px-8 py-3 text-center font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #c9a96e, #b8934a)',
              color: '#0f0f1a',
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </span>
            ) : (
              t('onboarding.continue')
            )}
          </button>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="rounded-lg px-8 py-3 font-semibold text-white/70 transition-colors hover:text-white hover:bg-white/10 disabled:cursor-not-allowed"
          >
            {t('onboarding.skip')}
          </button>
        </div>
      </div>
    </div>
  )
}
