import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router'
import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useAuthStore } from '@/store/useAppStore'
import CookieBanner from '@/components/CookieBanner'
import ErrorBoundary from '@/components/ErrorBoundary'

const Landing        = lazy(() => import('@/pages/Landing'))
const Pricing        = lazy(() => import('@/pages/Pricing'))
const Login          = lazy(() => import('@/pages/Login'))
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

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) return null

  if (!user) return <Navigate to="/login" replace />
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
              {/* Public */}
              <Route path="/"          element={<Landing />} />
              <Route path="/pricing"   element={<Pricing />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/privacy"   element={<Privacy />} />
              <Route path="/terms"     element={<Terms />} />

              {/* Auth flows (public — Supabase redirects here) */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password"  element={<ResetPassword />} />

              {/* Payment callbacks (public — Stripe redirects here) */}
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel"  element={<PaymentCancel />} />

              {/* Protected */}
              <Route path="/dashboard"    element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/analysis/:id" element={<RequireAuth><Analysis /></RequireAuth>} />
              <Route path="/history"      element={<RequireAuth><History /></RequireAuth>} />
              <Route path="/profile"      element={<RequireAuth><Profile /></RequireAuth>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
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
