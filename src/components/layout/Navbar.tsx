import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/useAppStore'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/queries/profile'

// ── Logo ──────────────────────────────────────────────────────────────────────

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m-5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 018.618 3.04A12.02 12.02 0 0121 9c0 5.591-3.824 10.29-9 11.622-5.176-1.332-9-6.03-9-11.622 0-1.042.133-2.052.382-3.016z"
      />
    </svg>
  )
}

function Logo({ transparent }: { transparent?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <LogoIcon className={`h-5 w-5 ${transparent ? 'text-white' : 'text-[#0f0f1a]'}`} />
      <span
        className="text-[18px] font-semibold leading-none tracking-tight"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <span className={transparent ? 'text-white' : 'text-[#0f0f1a]'}>Clausula</span>
        <span style={{ color: '#c9a96e' }}>AI</span>
      </span>
    </Link>
  )
}

// ── Credits pill ──────────────────────────────────────────────────────────────

function CreditsPill({ plan, credits }: { plan: string; credits: number }) {
  if (plan === 'pro') {
    return (
      <span className="inline-flex items-center rounded border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-2.5 py-1 text-xs font-semibold text-[#0f0f1a]">
        Pro · ∞
      </span>
    )
  }
  if (credits > 0) {
    return (
      <span className="inline-flex items-center rounded border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-2.5 py-1 text-xs font-semibold text-[#0f0f1a]">
        {credits} {credits === 1 ? 'análisis' : 'análisis'}
      </span>
    )
  }
  return (
    <Link
      to="/pricing"
      className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
    >
      Sin créditos
    </Link>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export default function Navbar({ variant }: { variant?: 'public' | 'app' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const { signOut } = useAuth()
  const { data: profile } = useProfile()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const showAuthNav = variant ? variant === 'app' : !!user
  const isLanding = pathname === '/'
  const isTransparent = isLanding && !scrolled && !showAuthNav

  const isHistoryActive = pathname === '/history' || pathname.startsWith('/analysis/')
  const isDashboardActive = pathname === '/dashboard'
  const isLettersActive = pathname === '/cartas'
  const isLegalChatActive = pathname === '/consulta'
  const isMonitorActive = pathname === '/monitor'

  // Scroll listener — only active on Landing
  useEffect(() => {
    setScrolled(false)
    if (!isLanding) return
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname, isLanding])

  useEffect(() => {
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '?'

  // ── Derived nav classes ───────────────────────────────────────────────────

  const navBase = 'sticky top-0 z-40 transition-all duration-300'
  const navAppearance = isTransparent
    ? 'bg-[#0f0f1a] border-transparent'
    : 'bg-white border-b border-[#e8e4dd]'
  const navLinkColor = isTransparent ? 'text-white/70 hover:text-white' : 'text-[#6b6860] hover:text-[#0f0f1a]'
  const navLinkActive = isTransparent ? 'bg-white/10 text-white' : 'bg-[#0f0f1a]/[0.06] text-[#0f0f1a]'

  return (
    <nav className={`${navBase} ${navAppearance}`}>
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Logo transparent={isTransparent} />

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 sm:flex">
          {showAuthNav ? (
            <>
              <Link
                to="/dashboard"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isDashboardActive ? navLinkActive : navLinkColor
                }`}
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                to="/history"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isHistoryActive ? navLinkActive : navLinkColor
                }`}
              >
                {t('nav.history')}
              </Link>
              {profile?.plan === 'pro' && (
                <Link
                  to="/monitor"
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isMonitorActive ? navLinkActive : navLinkColor
                  }`}
                >
                  {t('nav.monitor')}
                </Link>
              )}
              {profile?.plan === 'pro' && (
                <Link
                  to="/cartas"
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isLettersActive ? navLinkActive : navLinkColor
                  }`}
                >
                  {t('nav.letters')}
                </Link>
              )}
              <Link
                to="/consulta"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isLegalChatActive ? navLinkActive : navLinkColor
                }`}
              >
                {t('nav.legalChat')}
              </Link>

              {profile && (
                <div className="ml-1">
                  <CreditsPill plan={profile.plan} credits={profile.credits_remaining} />
                </div>
              )}

              {/* User avatar + dropdown */}
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f0f1a] text-xs font-bold text-white ring-2 ring-transparent transition-all hover:ring-[#c9a96e]/40 focus:outline-none"
                  aria-expanded={isDropdownOpen}
                  aria-label="Menú de usuario"
                >
                  {initials}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-lg border border-[#e8e4dd] bg-white py-1 shadow-lg">
                    <p className="truncate border-b border-[#e8e4dd] px-3 py-2 text-xs text-[#6b6860]">
                      {user?.email}
                    </p>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
                    >
                      {t('nav.history')}
                    </Link>
                    {profile?.plan === 'pro' && (
                      <Link
                        to="/monitor"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-3 py-2 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
                      >
                        {t('nav.monitor')}
                      </Link>
                    )}
                    {profile?.plan === 'pro' && (
                      <Link
                        to="/cartas"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-3 py-2 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
                      >
                        {t('nav.letters')}
                      </Link>
                    )}
                    <Link
                      to="/consulta"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
                    >
                      {t('nav.legalChat')}
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
                    >
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to="/pricing"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
                    >
                      {t('nav.pricing')}
                    </Link>
                    <div className="my-1 border-t border-[#e8e4dd]" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/pricing"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/pricing' ? navLinkActive : navLinkColor
                }`}
              >
                {t('nav.pricing')}
              </Link>
              <Link
                to="/login"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${navLinkColor}`}
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/login"
                className="ml-1 rounded-md px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 hover:-translate-y-px"
                style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)', color: '#0f0f1a' }}
              >
                {t('nav.cta')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((v) => !v)}
          className={`rounded-md p-2 transition-colors hover:bg-white/10 focus:outline-none sm:hidden ${
            isTransparent ? 'text-white/70' : 'text-[#6b6860]'
          }`}
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          className="border-t px-4 py-3 space-y-1 sm:hidden"
          style={{
            backgroundColor: isTransparent ? '#0f0f1a' : '#ffffff',
            borderColor: isTransparent ? 'rgba(255,255,255,0.08)' : '#e8e4dd',
          }}
        >
          {showAuthNav ? (
            <>
              <div className="flex items-center justify-between border-b border-[#e8e4dd] pb-3 mb-1">
                <p className="truncate text-xs text-[#6b6860]">{user?.email}</p>
                {profile && <CreditsPill plan={profile.plan} credits={profile.credits_remaining} />}
              </div>
              <Link
                to="/dashboard"
                className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isDashboardActive ? 'bg-[#0f0f1a]/[0.06] text-[#0f0f1a]' : 'text-[#0f0f1a] hover:bg-[#fafaf8]'
                }`}
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                to="/history"
                className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isHistoryActive ? 'bg-[#0f0f1a]/[0.06] text-[#0f0f1a]' : 'text-[#0f0f1a] hover:bg-[#fafaf8]'
                }`}
              >
                {t('nav.history')}
              </Link>
              {profile?.plan === 'pro' && (
                <Link
                  to="/monitor"
                  className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isMonitorActive ? 'bg-[#0f0f1a]/[0.06] text-[#0f0f1a]' : 'text-[#0f0f1a] hover:bg-[#fafaf8]'
                  }`}
                >
                  {t('nav.monitor')}
                </Link>
              )}
              {profile?.plan === 'pro' && (
                <Link
                  to="/cartas"
                  className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isLettersActive ? 'bg-[#0f0f1a]/[0.06] text-[#0f0f1a]' : 'text-[#0f0f1a] hover:bg-[#fafaf8]'
                  }`}
                >
                  {t('nav.letters')}
                </Link>
              )}
              <Link
                to="/consulta"
                className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isLegalChatActive ? 'bg-[#0f0f1a]/[0.06] text-[#0f0f1a]' : 'text-[#0f0f1a] hover:bg-[#fafaf8]'
                }`}
              >
                {t('nav.legalChat')}
              </Link>
              <Link
                to="/profile"
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
              >
                {t('nav.profile')}
              </Link>
              <Link
                to="/pricing"
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8]"
              >
                {t('nav.pricing')}
              </Link>
              <div className="pt-1 border-t border-[#e8e4dd]">
                <button
                  onClick={handleSignOut}
                  className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  {t('nav.logout')}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/pricing"
                className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-[#0f0f1a] hover:bg-[#fafaf8]'
                }`}
              >
                {t('nav.pricing')}
              </Link>
              <Link
                to="/login"
                className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isTransparent ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-[#0f0f1a] hover:bg-[#fafaf8]'
                }`}
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/login"
                className="block rounded-md px-3 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)', color: '#0f0f1a' }}
              >
                {t('nav.cta')}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
