import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useUploadStore } from '@/store/useAppStore'
import { useAnalyzeContract } from '@/hooks/useAnalyzeContract'

const MAX_SIZE_BYTES = 10 * 1024 * 1024

function validate(file: File): string | null {
  if (file.type !== 'application/pdf') return 'invalid_file_type'
  if (file.size > MAX_SIZE_BYTES) return 'file_too_large'
  return null
}

export default function UploadZone() {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { file, status, errorMessage, setFile, setError, reset } = useUploadStore()
  const { mutate: analyze, isPending } = useAnalyzeContract()

  const isLoading = isPending || status === 'uploading' || status === 'analyzing'

  function handleFile(f: File) {
    const err = validate(f)
    if (err) {
      setError(err)
      return
    }
    reset()
    setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => setIsDragging(false), [])

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    // Reset input so re-selecting same file fires onChange
    e.target.value = ''
  }

  const errorKeyMap: Record<string, string> = {
    invalid_file_type: t('errors.invalidFileType'),
    file_too_large: t('errors.fileTooLarge'),
    pdf_too_large: t('errors.pdfTooLarge'),
    unauthorized: t('errors.unauthorized'),
    no_credits: t('errors.noCredits'),
    rate_limit_exceeded: t('errors.rateLimitExceeded'),
  }

  return (
    <div className="w-full space-y-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label={t('upload.title')}
        onClick={() => !isLoading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!isLoading) inputRef.current?.click()
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          'relative flex min-h-52 cursor-pointer select-none flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all',
          isDragging ? 'border-[#1a1a2e] bg-indigo-50 scale-[1.01]' : 'border-gray-200 bg-gray-50 hover:border-[#1a1a2e]/40 hover:bg-gray-100/60',
          isLoading ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={onInputChange}
          disabled={isLoading}
          aria-hidden="true"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1a1a2e] border-t-transparent" />
            <p className="text-sm font-medium text-gray-600">
              {status === 'uploading' ? t('upload.uploading') : t('upload.analyzing')}
            </p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <svg className="h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="max-w-xs truncate text-sm font-medium text-gray-800">{file.name}</p>
            <p className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); reset() }}
              className="mt-1 text-xs text-gray-400 underline hover:text-gray-600"
            >
              {t('upload.changeFile')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-200">
              <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">{t('upload.title')}</p>
              <p className="mt-0.5 text-xs text-gray-400">{t('upload.subtitle')}</p>
            </div>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-400">
              {t('upload.hint')}
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {status === 'error' && errorMessage && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorKeyMap[errorMessage] ?? t('errors.generic')}
        </p>
      )}

      {/* Submit button */}
      {file && !isLoading && (
        <button
          type="button"
          onClick={() => analyze(file)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          {t('upload.analyze')}
        </button>
      )}
    </div>
  )
}
