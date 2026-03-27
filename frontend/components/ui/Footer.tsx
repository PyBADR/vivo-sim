'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useI18n()

  return (
    <footer className="border-t border-ds-border bg-ds-bg">
      <div className="ds-container py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-ds bg-ds-accent/12 border border-ds-accent/20 flex items-center justify-center">
              <span className="text-ds-accent font-bold text-xs">DS</span>
            </div>
            <span className="text-ds-text font-semibold tracking-tight">Deevo Sim</span>
          </div>
          <nav className="flex items-center gap-8 text-[13px] text-ds-text-secondary">
            <Link href="/demo" className="hover:text-ds-text transition-colors duration-200">{t('footer', 'simulation')}</Link>
            <Link href="/architecture" className="hover:text-ds-text transition-colors duration-200">{t('footer', 'architecture')}</Link>
            <Link href="/#about" className="hover:text-ds-text transition-colors duration-200">{t('footer', 'about')}</Link>
          </nav>
          <p className="text-micro text-ds-text-dim">
            &copy; {currentYear} {t('footer', 'copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
