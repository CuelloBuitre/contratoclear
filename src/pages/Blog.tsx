import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

const ARTICLES = [
  {
    id: 'clausulas-ilegales',
    categoryKey: 'blog.articles.clausulas.category',
    titleKey: 'blog.articles.clausulas.title',
    excerptKey: 'blog.articles.clausulas.excerpt',
  },
  {
    id: 'actualizar-renta',
    categoryKey: 'blog.articles.renta.category',
    titleKey: 'blog.articles.renta.title',
    excerptKey: 'blog.articles.renta.excerpt',
  },
  {
    id: 'zonas-tensionadas',
    categoryKey: 'blog.articles.zonas.category',
    titleKey: 'blog.articles.zonas.title',
    excerptKey: 'blog.articles.zonas.excerpt',
  },
]

export default function Blog() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">

      {/* Header */}
      <div className="mb-12 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
          {t('blog.overline')}
        </p>
        <h1
          className="text-3xl font-bold text-[#0f0f1a] sm:text-4xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t('blog.title')}
        </h1>
        <p className="mt-3 text-base text-[#6b6860]">{t('blog.subtitle')}</p>
      </div>

      {/* Article cards */}
      <div className="space-y-6">
        {ARTICLES.map((article) => (
          <div
            key={article.id}
            className="rounded-2xl border border-[#e8e4dd] bg-white p-6 sm:p-8"
            style={{ boxShadow: '0 1px 3px rgba(15,15,26,0.06)' }}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#e8e4dd] px-2.5 py-0.5 text-xs font-medium text-[#6b6860]">
                {t(article.categoryKey)}
              </span>
              <span className="rounded-full bg-[#0f0f1a] px-2.5 py-0.5 text-xs font-semibold text-white">
                {t('blog.soon')}
              </span>
            </div>
            <h2 className="mb-2 text-lg font-semibold leading-snug text-[#0f0f1a] sm:text-xl">
              {t(article.titleKey)}
            </h2>
            <p className="line-clamp-2 text-sm leading-relaxed text-[#6b6860]">
              {t(article.excerptKey)}
            </p>
          </div>
        ))}
      </div>

      {/* CTA block */}
      <div className="mt-12 rounded-2xl bg-[#1a1a2e] px-8 py-10 text-center">
        <p className="mb-5 text-base font-semibold leading-snug text-white sm:text-lg">
          {t('blog.cta')}
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-[#0f0f1a] transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #c9a96e, #b8934a)' }}
        >
          {t('blog.ctaButton')}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

    </div>
  )
}
