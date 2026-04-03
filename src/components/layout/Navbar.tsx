import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'

export default function Navbar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    setIsMenuOpen(false)
    navigate('/')
  }

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-[#1a1a2e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white">{t('nav.logo')}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 sm:flex">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/history"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {t('nav.history')}
                </Link>
                <span className="mx-2 hidden text-xs text-white/30 lg:block">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:border-white/40 hover:text-white"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/pricing"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {t('nav.pricing')}
                </Link>
                <Link
                  to="/login"
                  className="ml-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-white/90"
                >
                  {t('nav.login')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            className="rounded-md p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none sm:hidden"
            aria-expanded={isMenuOpen}
            aria-label="Abrir menú"
          >
            {isMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-white/10 bg-[#16213e] px-4 py-3 space-y-1 sm:hidden">
          {user ? (
            <>
              <p className="truncate px-3 pb-2 text-xs text-white/30">{user.email}</p>
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                to="/history"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t('nav.history')}
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/pricing"
                onClick={closeMenu}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t('nav.pricing')}
              </Link>
              <Link
                to="/login"
                onClick={closeMenu}
                className="block rounded-lg bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#1a1a2e] transition-colors hover:bg-white/90"
              >
                {t('nav.login')}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
