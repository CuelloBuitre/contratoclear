import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfile } from '@/queries/profile'
import { useGenerateLetter, LetterType } from '@/hooks/useGenerateLetter'

// ── Text cleaner ──────────────────────────────────────────────────────────────

function cleanText(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[.*?\]/g, '')
    .replace(/#{1,6}\s/g, '')
    .trim()
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

// ── Letter type configs ────────────────────────────────────────────────────────

interface LetterTypeConfig {
  type: LetterType
  iconColor: string
  iconBg: string
  badgeColor: string
  Icon: React.FC<{ className?: string }>
}

const LETTER_TYPES: LetterTypeConfig[] = [
  { type: 'impago',               Icon: AlertCircleIcon, iconColor: 'text-red-600',   iconBg: 'bg-red-50',   badgeColor: 'bg-red-50 text-red-700 border-red-200' },
  { type: 'actualizacion_renta',  Icon: TrendingUpIcon,  iconColor: 'text-amber-600', iconBg: 'bg-amber-50', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { type: 'preaviso_no_renovacion', Icon: CalendarIcon,  iconColor: 'text-blue-600',  iconBg: 'bg-blue-50',  badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { type: 'devolucion_fianza',    Icon: WalletIcon,      iconColor: 'text-green-600', iconBg: 'bg-green-50', badgeColor: 'bg-green-50 text-green-700 border-green-200' },
]

// ── Field component ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  error?: string
  children: React.ReactNode
}

function Field({ label, error, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[#0f0f1a]">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-[#e8e4dd] bg-white px-3 py-2.5 text-sm text-[#0f0f1a] placeholder-[#b0a898] outline-none transition-colors focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20'

// Helper to get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

// ── Form schemas ──────────────────────────────────────────────────────────────

const impagoSchema = z.object({
  ciudad:            z.string().min(1, 'Requerido'),
  nombre_arrendador: z.string().min(1, 'Requerido'),
  nombre_inquilino:  z.string().min(1, 'Requerido'),
  direccion:         z.string().min(1, 'Requerido'),
  meses:             z.string().min(1, 'Requerido'),
  importe:           z.string().min(1, 'Requerido'),
})

const actualizacionRentaSchema = z.object({
  ciudad:            z.string().min(1, 'Requerido'),
  nombre_arrendador: z.string().min(1, 'Requerido'),
  nombre_inquilino:  z.string().min(1, 'Requerido'),
  direccion:         z.string().min(1, 'Requerido'),
  renta_actual:      z.string().min(1, 'Requerido'),
  renta_nueva:       z.string().min(1, 'Requerido'),
  indice:            z.string().min(1, 'Requerido'),
  fecha_efectiva:    z.string().min(1, 'Requerido'),
})

const preavisoSchema = z.object({
  ciudad:              z.string().min(1, 'Requerido'),
  remitente:           z.enum(['arrendador', 'inquilino']),
  nombre_remitente:    z.string().min(1, 'Requerido'),
  nombre_destinatario: z.string().min(1, 'Requerido'),
  direccion:           z.string().min(1, 'Requerido'),
  fecha_vencimiento:   z.string().min(1, 'Requerido'),
})

const devolucionFianzaSchema = z.object({
  ciudad:            z.string().min(1, 'Requerido'),
  nombre_inquilino:  z.string().min(1, 'Requerido'),
  nombre_arrendador: z.string().min(1, 'Requerido'),
  direccion:         z.string().min(1, 'Requerido'),
  importe:           z.string().min(1, 'Requerido'),
  fecha_entrega:     z.string().min(1, 'Requerido'),
})

type ImpagoValues            = z.infer<typeof impagoSchema>
type ActualizacionRentaValues = z.infer<typeof actualizacionRentaSchema>
type PreavisoValues          = z.infer<typeof preavisoSchema>
type DevolucionFianzaValues  = z.infer<typeof devolucionFianzaSchema>

// ── Loading view ──────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  'letters.loading.step1',
  'letters.loading.step2',
  'letters.loading.step3',
  'letters.loading.step4',
  'letters.loading.step5',
] as const

const LOADING_TOTAL_SECONDS = 10
const CIRCUMFERENCE = 100.53 // 2π × r=16

function LetterLoadingView() {
  const { t } = useTranslation()
  const [stepIndex, setStepIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(LOADING_TOTAL_SECONDS)

  // Advance message every 2s
  useEffect(() => {
    if (stepIndex >= LOADING_STEPS.length - 1) return
    const timer = setTimeout(() => setStepIndex((i) => i + 1), 2000)
    return () => clearTimeout(timer)
  }, [stepIndex])

  // Countdown every 1s
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])

  const elapsed = LOADING_TOTAL_SECONDS - timeLeft
  const dashOffset = CIRCUMFERENCE * (1 - Math.min(elapsed / LOADING_TOTAL_SECONDS, 1))

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {/* Progress ring + document icon */}
      <div className="relative mb-6">
        <svg width="72" height="72" viewBox="0 0 36 36" aria-hidden="true">
          {/* Background track */}
          <circle cx="18" cy="18" r="16" fill="none" stroke="#e8e4dd" strokeWidth="2" />
          {/* Progress arc */}
          <circle
            cx="18" cy="18" r="16"
            fill="none"
            stroke="#c9a96e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 1s linear',
              transformOrigin: 'center',
              transform: 'rotate(-90deg)',
            }}
          />
        </svg>
        {/* Document icon centred in ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-7 w-7"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
            aria-hidden="true"
            style={{ color: '#c9a96e', animation: 'pulse-gold 2s ease-in-out infinite' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      {/* Sequential status message */}
      <p className="min-h-5 text-sm font-medium text-[#0f0f1a]">
        {t(LOADING_STEPS[stepIndex])}
      </p>

      {/* Countdown */}
      <p className="mt-2 text-xs text-[#b0a898]">
        {timeLeft > 0
          ? t('letters.loading.countdown', { seconds: timeLeft })
          : t('letters.loading.almostDone')}
      </p>
    </div>
  )
}

// ── Form components ───────────────────────────────────────────────────────────

function ImpagoForm({ onSubmit, isLoading }: {
  onSubmit: (data: Record<string, string>) => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors } } = useForm<ImpagoValues>({
    resolver: zodResolver(impagoSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label={t('letters.fields.ciudad')} error={errors.ciudad?.message}>
        <input {...register('ciudad')} className={inputClass} placeholder="Madrid" />
      </Field>
      <Field label={t('letters.fields.nombre_arrendador')} error={errors.nombre_arrendador?.message}>
        <input {...register('nombre_arrendador')} className={inputClass}
          placeholder="Nombre completo del arrendador" />
      </Field>
      <Field label={t('letters.fields.nombre_inquilino')} error={errors.nombre_inquilino?.message}>
        <input {...register('nombre_inquilino')} className={inputClass}
          placeholder="Nombre completo del inquilino" />
      </Field>
      <Field label={t('letters.fields.direccion')} error={errors.direccion?.message}>
        <input {...register('direccion')} className={inputClass}
          placeholder="Calle, número, piso, ciudad" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('letters.fields.meses')} error={errors.meses?.message}>
          <input {...register('meses')} type="number" min="1" className={inputClass}
            placeholder="Ej. 2" />
        </Field>
        <Field label={t('letters.fields.importe')} error={errors.importe?.message}>
          <input {...register('importe')} type="number" min="0" step="0.01" className={inputClass}
            placeholder="Ej. 1600" />
        </Field>
      </div>
      <SubmitButton isLoading={isLoading} />
    </form>
  )
}

function ActualizacionRentaForm({ onSubmit, isLoading }: {
  onSubmit: (data: Record<string, string>) => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors } } = useForm<ActualizacionRentaValues>({
    resolver: zodResolver(actualizacionRentaSchema),
    defaultValues: { indice: '2.2' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label={t('letters.fields.ciudad')} error={errors.ciudad?.message}>
        <input {...register('ciudad')} className={inputClass} placeholder="Madrid" />
      </Field>
      <Field label={t('letters.fields.nombre_arrendador')} error={errors.nombre_arrendador?.message}>
        <input {...register('nombre_arrendador')} className={inputClass}
          placeholder="Nombre completo del arrendador" />
      </Field>
      <Field label={t('letters.fields.nombre_inquilino')} error={errors.nombre_inquilino?.message}>
        <input {...register('nombre_inquilino')} className={inputClass}
          placeholder="Nombre completo del inquilino" />
      </Field>
      <Field label={t('letters.fields.direccion')} error={errors.direccion?.message}>
        <input {...register('direccion')} className={inputClass}
          placeholder="Calle, número, piso, ciudad" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('letters.fields.renta_actual')} error={errors.renta_actual?.message}>
          <input {...register('renta_actual')} type="number" min="0" step="0.01" className={inputClass}
            placeholder="Ej. 900" />
        </Field>
        <Field label={t('letters.fields.renta_nueva')} error={errors.renta_nueva?.message}>
          <input {...register('renta_nueva')} type="number" min="0" step="0.01" className={inputClass}
            placeholder="Ej. 919.80" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('letters.fields.indice')} error={errors.indice?.message}>
          <input {...register('indice')} type="number" min="0" step="0.01" className={inputClass}
            placeholder="2.2" />
        </Field>
        <Field label={t('letters.fields.fecha_efectiva')} error={errors.fecha_efectiva?.message}>
          <input {...register('fecha_efectiva')} type="date" min={getTodayDate()} className={inputClass} />
        </Field>
      </div>
      <SubmitButton isLoading={isLoading} />
    </form>
  )
}

function PreavisoForm({ onSubmit, isLoading }: {
  onSubmit: (data: Record<string, string>) => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors } } = useForm<PreavisoValues>({
    resolver: zodResolver(preavisoSchema),
    defaultValues: { remitente: 'arrendador' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label={t('letters.fields.ciudad')} error={errors.ciudad?.message}>
        <input {...register('ciudad')} className={inputClass} placeholder="Madrid" />
      </Field>
      <Field label={t('letters.fields.remitente')} error={errors.remitente?.message}>
        <div className="flex gap-4">
          {(['arrendador', 'inquilino'] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm text-[#0f0f1a]">
              <input {...register('remitente')} type="radio" value={opt}
                className="accent-[#c9a96e]" />
              {t(`letters.fields.remitente_${opt}`)}
            </label>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('letters.fields.nombre_remitente')} error={errors.nombre_remitente?.message}>
          <input {...register('nombre_remitente')} className={inputClass}
            placeholder="Nombre del remitente" />
        </Field>
        <Field label={t('letters.fields.nombre_destinatario')} error={errors.nombre_destinatario?.message}>
          <input {...register('nombre_destinatario')} className={inputClass}
            placeholder="Nombre del destinatario" />
        </Field>
      </div>
      <Field label={t('letters.fields.direccion')} error={errors.direccion?.message}>
        <input {...register('direccion')} className={inputClass}
          placeholder="Calle, número, piso, ciudad" />
      </Field>
      <Field label={t('letters.fields.fecha_vencimiento')} error={errors.fecha_vencimiento?.message}>
        <input {...register('fecha_vencimiento')} type="date" min={getTodayDate()} className={inputClass} />
      </Field>
      <SubmitButton isLoading={isLoading} />
    </form>
  )
}

function DevolucionFianzaForm({ onSubmit, isLoading }: {
  onSubmit: (data: Record<string, string>) => void
  isLoading: boolean
}) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors } } = useForm<DevolucionFianzaValues>({
    resolver: zodResolver(devolucionFianzaSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label={t('letters.fields.ciudad')} error={errors.ciudad?.message}>
        <input {...register('ciudad')} className={inputClass} placeholder="Madrid" />
      </Field>
      <Field label={t('letters.fields.nombre_inquilino')} error={errors.nombre_inquilino?.message}>
        <input {...register('nombre_inquilino')} className={inputClass}
          placeholder="Nombre completo del inquilino" />
      </Field>
      <Field label={t('letters.fields.nombre_arrendador')} error={errors.nombre_arrendador?.message}>
        <input {...register('nombre_arrendador')} className={inputClass}
          placeholder="Nombre completo del arrendador" />
      </Field>
      <Field label={t('letters.fields.direccion')} error={errors.direccion?.message}>
        <input {...register('direccion')} className={inputClass}
          placeholder="Calle, número, piso, ciudad" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('letters.fields.importe')} error={errors.importe?.message}>
          <input {...register('importe')} type="number" min="0" step="0.01" className={inputClass}
            placeholder="Ej. 800" />
        </Field>
        <Field label={t('letters.fields.fecha_entrega')} error={errors.fecha_entrega?.message}>
          <input {...register('fecha_entrega')} type="date" min={getTodayDate()} className={inputClass} />
        </Field>
      </div>
      <SubmitButton isLoading={isLoading} />
    </form>
  )
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  const { t } = useTranslation()
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full rounded-lg py-3 text-sm font-semibold text-[#0f0f1a] transition-opacity hover:opacity-90 disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)' }}
    >
      {isLoading ? t('letters.generating') : t('letters.generateButton')}
    </button>
  )
}

// ── PDF download helper ───────────────────────────────────────────────────────

async function downloadLetterPdf(letterText: string) {
  const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')

  const styles = StyleSheet.create({
    page:      { padding: 60, fontFamily: 'Helvetica', fontSize: 11, lineHeight: 1.6 },
    brand:     { fontSize: 9, color: '#c9a96e', marginBottom: 20 },
    para:      { color: '#1a1a1a', marginBottom: 8 },
    heading:   { color: '#1a1a1a', fontFamily: 'Helvetica-Bold', marginBottom: 6, marginTop: 10 },
    signature: { color: '#1a1a1a', marginTop: 20 },
  })

  // Split into paragraphs on double (or more) newlines
  const paragraphs = letterText.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)

  // A paragraph is a section heading if its first line is all-caps, short, non-empty
  const isHeading = (p: string) => {
    const first = p.split('\n')[0].trim()
    return first.length > 2 && first.length < 80 && first === first.toUpperCase()
  }

  // The last 1-2 paragraphs are the signature block
  const isSignature = (idx: number) =>
    idx >= paragraphs.length - 2 ||
    /\b(Atentamente|Firmado|Fdo\.|En\s+\w+,\s+a\s+\d)/i.test(paragraphs[idx])

  const LetterDoc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Branding header */}
        <View style={{ marginBottom: 4 }}>
          <Text style={styles.brand}>ClausulaAI — Carta legal generada automáticamente</Text>
        </View>
        {paragraphs.map((para, i) => {
          const heading = isHeading(para)
          const sig = isSignature(i)
          return (
            // wrap={false} keeps short/heading/signature blocks on a single page
            <View key={i} wrap={!heading && !sig} style={sig ? { marginTop: 20 } : {}}>
              <Text style={heading ? styles.heading : sig ? styles.signature : styles.para}>
                {para}
              </Text>
            </View>
          )
        })}
      </Page>
    </Document>
  )

  const blob = await pdf(<LetterDoc />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'carta-legal-clausulaai.pdf'
  a.click()
  URL.revokeObjectURL(url)
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  config: LetterTypeConfig
  onClose: () => void
}

function LetterModal({ config, onClose }: ModalProps) {
  const { t } = useTranslation()
  const { mutate, isPending, data, error, reset } = useGenerateLetter()

  const [editedText, setEditedText] = useState<string | null>(null)
  const [isModified, setIsModified] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const letterType = config.type

  // Populate editor when letter arrives
  useEffect(() => {
    if (data) {
      setEditedText(cleanText(data.letter_text))
      setIsModified(false)
    }
  }, [data])

  function handleSubmit(formData: Record<string, string>) {
    mutate({ letter_type: letterType, contract_data: formData })
  }

  function handleEdit(value: string) {
    setEditedText(value)
    setIsModified(true)
  }

  function handleRestore() {
    if (data) {
      setEditedText(cleanText(data.letter_text))
      setIsModified(false)
    }
  }

  const handleNew = useCallback(() => {
    if (isModified && !window.confirm(t('letters.actions.confirmNew'))) return
    reset()
    setEditedText(null)
    setIsModified(false)
  }, [isModified, reset, t])

  async function handleCopy() {
    await navigator.clipboard.writeText(editedText ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDownload() {
    setPdfLoading(true)
    try {
      await downloadLetterPdf(editedText ?? '')
    } finally {
      setPdfLoading(false)
    }
  }

  const showPreview = !isPending && !!data

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      style={{ backgroundColor: 'rgba(15,15,26,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal box — mobile: full-screen sheet; desktop: resizable */}
      <style>{`
        @keyframes pulse-gold {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.95); }
        }
        .letter-modal-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .letter-textarea {
          flex: 1;
          overflow-y: auto;
          resize: none;
          min-height: 0;
        }
        .letter-modal-box {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e8e4dd;
          border-top: 3px solid #c9a96e;
          background: #f8fafc;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          border-radius: 1rem 1rem 0 0;
          width: 100%;
          height: 95svh;
        }
        @media (min-width: 640px) {
          .letter-modal-box {
            resize: both;
            overflow: hidden;
            min-width: 500px;
            min-height: 400px;
            width: 720px;
            height: 600px;
            max-width: 95vw;
            max-height: 90vh;
            border-radius: 1rem;
          }
        }
      `}</style>
      <div className="letter-modal-box">
          {/* Header */}
          <div className="flex flex-none items-center justify-between border-b border-[#e8e4dd] px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-[#0f0f1a]">
                {t(`letters.types.${letterType}.title`)}
              </h2>
              <span className={`mt-1 inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${config.badgeColor}`}>
                {t(`letters.types.${letterType}.badge`)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {showPreview && isModified && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  {t('letters.preview.edited')}
                </span>
              )}
              <button
                onClick={onClose}
                className="rounded-md p-1.5 text-[#6b6860] transition-colors hover:bg-[#fafaf8] hover:text-[#0f0f1a]"
                aria-label={t('letters.close')}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body — only the textarea scrolls; loading and forms scroll their own container */}
          <div className="letter-modal-content">
            {isPending ? (
              <div className="overflow-y-auto">
                <LetterLoadingView />
              </div>
            ) : showPreview ? (
              <div className="flex flex-1 flex-col overflow-hidden bg-white" style={{ boxShadow: 'inset 0 2px 8px rgba(15,15,26,0.06)' }}>
                <textarea
                  value={editedText ?? ''}
                  onChange={(e) => handleEdit(e.target.value)}
                  className="letter-textarea w-full bg-white outline-none"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    padding: '2rem',
                    border: 'none',
                  }}
                />
              </div>
            ) : (
              <div className="overflow-y-auto px-6 py-5">
                {error && error.message !== 'session_expired' && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error.message === 'pro_required'
                      ? t('letters.errors.pro_required')
                      : t('letters.errors.generic')}
                  </div>
                )}
                {letterType === 'impago' && (
                  <ImpagoForm onSubmit={handleSubmit} isLoading={isPending} />
                )}
                {letterType === 'actualizacion_renta' && (
                  <ActualizacionRentaForm onSubmit={handleSubmit} isLoading={isPending} />
                )}
                {letterType === 'preaviso_no_renovacion' && (
                  <PreavisoForm onSubmit={handleSubmit} isLoading={isPending} />
                )}
                {letterType === 'devolucion_fianza' && (
                  <DevolucionFianzaForm onSubmit={handleSubmit} isLoading={isPending} />
                )}
              </div>
            )}
          </div>

          {/* Footer — fixed bottom bar, only when preview */}
          {showPreview && (
            <div className="flex flex-none flex-col gap-2 border-t border-[#e8e4dd] bg-[#f8fafc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 gap-2">
                <button
                  onClick={handleCopy}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e8e4dd] bg-white px-3 py-2 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8] sm:flex-none"
                >
                  <CopyIcon className="h-4 w-4" />
                  {copied ? t('letters.copied') : t('letters.actions.copy')}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={pdfLoading}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#e8e4dd] bg-white px-3 py-2 text-sm font-medium text-[#0f0f1a] transition-colors hover:bg-[#fafaf8] disabled:opacity-60 sm:flex-none"
                >
                  <DownloadIcon className="h-4 w-4" />
                  {pdfLoading ? '...' : t('letters.actions.download')}
                </button>
                {isModified && (
                  <button
                    onClick={handleRestore}
                    className="hidden items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 sm:flex"
                  >
                    {t('letters.preview.restore')}
                  </button>
                )}
              </div>
              <button
                onClick={handleNew}
                className="rounded-lg border border-[#e8e4dd] px-3 py-2 text-sm font-medium text-[#6b6860] transition-colors hover:bg-[#fafaf8] hover:text-[#0f0f1a]"
              >
                {t('letters.actions.new')}
              </button>
            </div>
          )}

          {/* Grip icon — desktop only visual indicator */}
          {showPreview && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 right-2 hidden select-none sm:flex"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-[#c9c9c9]">
                <circle cx="10" cy="10" r="1.2" fill="currentColor" />
                <circle cx="6"  cy="10" r="1.2" fill="currentColor" />
                <circle cx="10" cy="6"  r="1.2" fill="currentColor" />
              </svg>
            </div>
          )}
      </div>
    </div>
  )
}


// ── Letter type card ──────────────────────────────────────────────────────────

function LetterTypeCard({ config, onSelect }: { config: LetterTypeConfig; onSelect: () => void }) {
  const { t } = useTranslation()
  const { Icon, iconColor, iconBg, badgeColor, type } = config

  return (
    <div className="card-lift flex flex-col rounded-xl border border-[#e8e4dd] bg-white p-6"
         style={{ boxShadow: '0 1px 3px rgba(15,15,26,0.06)' }}>
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <span className={`mb-3 inline-flex self-start items-center rounded border px-2 py-0.5 text-xs font-semibold ${badgeColor}`}>
        {t(`letters.types.${type}.badge`)}
      </span>
      <h3 className="mb-2 font-display text-[17px] font-semibold text-[#0f0f1a]">
        {t(`letters.types.${type}.title`)}
      </h3>
      <p className="mb-5 flex-1 text-sm leading-[1.65] text-[#6b6860]">
        {t(`letters.types.${type}.description`)}
      </p>
      <button
        onClick={onSelect}
        className="w-full rounded-lg border border-[#c9a96e]/40 py-2.5 text-sm font-semibold text-[#0f0f1a] transition-all hover:-translate-y-px hover:border-[#c9a96e] hover:shadow-sm"
        style={{ background: 'linear-gradient(135deg, #c9a96e08, #b8934a08)' }}
      >
        {t('letters.generateButton')}
      </button>
    </div>
  )
}

// ── Pro gate ──────────────────────────────────────────────────────────────────

function ProGate() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#c9a96e]/30 bg-[#c9a96e]/5 px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/15">
        <svg className="h-7 w-7 text-[#c9a96e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p className="mb-1 text-sm font-semibold text-[#0f0f1a]">{t('letters.proRequired')}</p>
      <p className="mb-6 text-sm text-[#6b6860]">{t('letters.proRequiredSub')}</p>
      <Link
        to="/pricing"
        className="rounded-lg px-6 py-2.5 text-sm font-semibold text-[#0f0f1a] transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)' }}
      >
        {t('letters.proRequiredCta')}
      </Link>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Letters() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useProfile()
  const [activeType, setActiveType] = useState<LetterTypeConfig | null>(null)

  const isPro = profile?.plan === 'pro'

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14">
      {/* Page header */}
      <div className="mb-10">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
          {t('letters.overline')}
        </p>
        <h1 className="font-display text-2xl font-bold text-[#0f0f1a] sm:text-3xl">
          {t('letters.title')}
        </h1>
        <p className="mt-2 text-base text-[#6b6860]">{t('letters.subtitle')}</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border border-[#e8e4dd] bg-[#f5f3ef]" />
          ))}
        </div>
      ) : isPro ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {LETTER_TYPES.map((config) => (
            <LetterTypeCard
              key={config.type}
              config={config}
              onSelect={() => setActiveType(config)}
            />
          ))}
        </div>
      ) : (
        <ProGate />
      )}

      {/* Modal */}
      {activeType && (
        <LetterModal
          config={activeType}
          onClose={() => setActiveType(null)}
        />
      )}
    </div>
  )
}
