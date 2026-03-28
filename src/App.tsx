import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Suspense, lazy, useEffect } from 'react'
import { useAuthStore } from '@/store/useAppStore'
import CookieBanner from '@/components/CookieBanner'

const Landing       = lazy(() => import('@/pages/Landing'))
const Pricing       = lazy(() => import('@/pages/Pricing'))
const Login         = lazy(() => import('@/pages/Login'))
const Dashboard     = lazy(() => import('@/pages/Dashboard'))
const Analysis      = lazy(() => import('@/pages/Analysis'))
const History       = lazy(() => import('@/pages/History'))
const NotFound      = lazy(() => import('@/pages/NotFound'))
const Privacy       = lazy(() => import('@/pages/Privacy'))
const Terms         = lazy(() => import('@/pages/Terms'))
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'))
const PaymentCancel  = lazy(() => import('@/pages/PaymentCancel'))

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const Fallback = (
  <div className="flex h-screen items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" />
  </div>
)

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <BrowserRouter>
      <Suspense fallback={Fallback}>
        <Routes>
          {/* Public */}
          <Route path="/"          element={<Landing />} />
          <Route path="/pricing"   element={<Pricing />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/privacy"   element={<Privacy />} />
          <Route path="/terms"     element={<Terms />} />

          {/* Payment callbacks (public — Stripe redirects here) */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel"  element={<PaymentCancel />} />

          {/* Protected */}
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/analysis/:id" element={<RequireAuth><Analysis /></RequireAuth>} />
          <Route path="/history"   element={<RequireAuth><History /></RequireAuth>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Global cookie consent banner */}
      <CookieBanner />
    </BrowserRouter>
  )
}
