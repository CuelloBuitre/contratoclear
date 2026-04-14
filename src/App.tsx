import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router'
import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAuthStore } from '@/store/useAppStore'
import { useProfile } from '@/queries/profile'
import CookieBanner from '@/components/CookieBanner'
import ErrorBoundary from '@/components/ErrorBoundary'
import PublicLayout from '@/components/layout/PublicLayout'
import AppLayout from '@/components/layout/AppLayout'

const Landing        = lazy(() => import('@/pages/Landing'))
const Pricing        = lazy(() => import('@/pages/Pricing'))
const Login          = lazy(() => import('@/pages/Login'))
const Onboarding     = lazy(() => import('@/pages/Onboarding'))
const Dashboard      = lazy(() => import('@/pages/Dashboard'))
const Analysis       = lazy(() => import('@/pages/Analysis'))
const History        = lazy(() => import('@/pages/History'))
const NotFound       = lazy(() => import('@/pages/NotFound'))
const Privacy        = lazy(() => import('@/pages/Privacy'))
const Terms          = lazy(() => import('@/pages/Terms'))
const PaymentSuccess  = lazy(() => import('@/pages/PaymentSuccess'))
const PaymentCancel   = lazy(() => import('@/pages/PaymentCancel'))
const ForgotPassword  = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword   = lazy(() => import('@/pages/ResetPassword'))
const Profile         = lazy(() => import('@/pages/Profile'))
const Letters         = lazy(() => import('@/pages/Letters'))
const Calculadora     = lazy(() => import('@/pages/Calculadora'))
const LegalChat       = lazy(() => import('@/pages/LegalChat'))
const ContractMonitor = lazy(() => import('@/pages/ContractMonitor'))

// ── Auth guard ────────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) return null

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { data: profile, isLoading: profileLoading } = useProfile()

  if (isLoading || profileLoading) return null

  if (!user) return <Navigate to="/login" replace />

  if (!profile?.onboarding_completed) return <Navigate to="/onboarding" replace />

  return <>{children}</>
}

const Fallback = null

function AppRoutes() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{}}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <Suspense fallback={Fallback}>
            <Routes location={location}>
              {/* Public — with Footer */}
              <Route path="/"        element={<PublicLayout><Landing /></PublicLayout>} />
              <Route path="/pricing" element={<PublicLayout><Pricing /></PublicLayout>} />
              <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
              <Route path="/terms"   element={<PublicLayout><Terms /></PublicLayout>} />
              <Route path="/payment/success" element={<PublicLayout><PaymentSuccess /></PublicLayout>} />
              <Route path="/payment/cancel"  element={<PublicLayout><PaymentCancel /></PublicLayout>} />
              <Route path="/calculadora"     element={<PublicLayout><Calculadora /></PublicLayout>} />

              {/* Auth flows — full-screen, no Footer */}
              <Route path="/login"           element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password"  element={<ResetPassword />} />
              <Route path="/onboarding"      element={<RequireAuth><Onboarding /></RequireAuth>} />

              {/* Protected — with app background, no Footer */}
              <Route path="/dashboard"    element={<RequireOnboarding><AppLayout><Dashboard /></AppLayout></RequireOnboarding>} />
              <Route path="/analysis/:id" element={<RequireOnboarding><AppLayout><Analysis /></AppLayout></RequireOnboarding>} />
              <Route path="/history"      element={<RequireOnboarding><AppLayout><History /></AppLayout></RequireOnboarding>} />
              <Route path="/profile"      element={<RequireOnboarding><AppLayout><Profile /></AppLayout></RequireOnboarding>} />
              <Route path="/cartas"      element={<RequireOnboarding><AppLayout><Letters /></AppLayout></RequireOnboarding>} />
              <Route path="/consulta"    element={<RequireOnboarding><AppLayout><LegalChat /></AppLayout></RequireOnboarding>} />
              <Route path="/monitor"     element={<RequireOnboarding><AppLayout><ContractMonitor /></AppLayout></RequireOnboarding>} />

              {/* 404 */}
              <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Global cookie consent banner */}
      <CookieBanner />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  )
}
