import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import * as Sentry from '@sentry/react'
import i18next from 'i18next'

interface Props {
  children: ReactNode
  message?: string
}

interface State {
  hasError: boolean
}

// Error boundaries require a class component — the only valid exception to the no-class rule.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.PROD) {
      Sentry.captureException(error, { extra: { componentStack: info.componentStack } })
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const message = this.props.message ?? i18next.t('errors.boundary')

    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="max-w-sm text-base font-medium text-gray-700">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-[#1a1a2e] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e] focus:ring-offset-2"
        >
          {i18next.t('errors.boundaryRetry')}
        </button>
      </div>
    )
  }
}
