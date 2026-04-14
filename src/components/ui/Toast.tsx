import { useToastStore } from '@/store/useAppStore'
import type { ToastItem } from '@/store/useAppStore'

// ── Icons ─────────────────────────────────────────────────────────────────────

function CheckCircleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function AlertTriangleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ── Config ────────────────────────────────────────────────────────────────────

const TOAST_CONFIG = {
  success: { Icon: CheckCircleIcon, iconClass: 'text-green-500',  borderClass: 'border-l-green-500' },
  error:   { Icon: XCircleIcon,     iconClass: 'text-red-500',    borderClass: 'border-l-red-500'   },
  info:    { Icon: InfoIcon,        iconClass: 'text-blue-500',   borderClass: 'border-l-blue-500'  },
  warning: { Icon: AlertTriangleIcon, iconClass: 'text-amber-500', borderClass: 'border-l-amber-500' },
} as const

// ── Single item ───────────────────────────────────────────────────────────────

function Toast({ id, type, message, onRemove }: ToastItem & { onRemove: (id: string) => void }) {
  const { Icon, iconClass, borderClass } = TOAST_CONFIG[type]

  return (
    <div
      className={`toast-slide-in flex w-full items-start gap-3 rounded-xl border border-l-4 bg-white px-4 py-3 shadow-lg sm:w-auto ${borderClass}`}
      style={{ minWidth: 280, maxWidth: 380 }}
      role="alert"
    >
      <span className={iconClass}><Icon /></span>
      <p className="flex-1 text-sm leading-snug text-[#0f0f1a]">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="shrink-0 text-[#b0a898] transition-colors hover:text-[#0f0f1a]"
        aria-label="Cerrar"
      >
        <CloseIcon />
      </button>
    </div>
  )
}

// ── Container ─────────────────────────────────────────────────────────────────

export default function ToastContainer() {
  const toasts    = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .toast-slide-in { animation: toast-slide-in 0.18s ease-out forwards; }
      `}</style>
      {/* Mobile: bottom-center full-width. Desktop: bottom-right auto-width. */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] flex flex-col items-center gap-2 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:items-end sm:p-0"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </>
  )
}
