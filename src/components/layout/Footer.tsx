import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-[#1a1a2e] text-white/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div>
            <p className="text-base font-bold text-white">ClausulaAI</p>
            <p className="mt-0.5 text-sm">{t('footer.tagline')}</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link to="/terms" className="transition-colors hover:text-white">{t('footer.legal')}</Link>
            <Link to="/privacy" className="transition-colors hover:text-white">{t('footer.privacy')}</Link>
            <a href="mailto:hola@clausulaai.es" className="transition-colors hover:text-white">{t('footer.contact')}</a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 space-y-2 text-center text-xs">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <p className="text-white/40">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  )
}
