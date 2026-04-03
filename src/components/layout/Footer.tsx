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
            <Link to="#" className="hover:text-white transition-colors">{t('footer.legal')}</Link>
            <Link to="#" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
            <Link to="#" className="hover:text-white transition-colors">{t('footer.contact')}</Link>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  )
}
