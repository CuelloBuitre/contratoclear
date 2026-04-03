import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'clausulaai_cookie_consent'

export default function CookieBanner() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true)
      }
    } catch {
      // localStorage blocked (private browsing / strict settings) — don't show
    }
  }, [])

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, 'accepted') } catch { /* ignore */ }
    setVisible(false)
  }

  function decline() {
    try { localStorage.setItem(STORAGE_KEY, 'declined') } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-4 shadow-2xl sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        {/* Message */}
        <p className="flex-1 text-sm text-gray-600">
          {t('cookies.message')}{' '}
          <Link
            to="/privacy"
            className="font-medium text-indigo-600 hover:underline"
          >
            {t('cookies.learnMore')}
          </Link>
        </p>

        {/* Buttons */}
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            {t('cookies.decline')}
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-[#1a1a2e] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
