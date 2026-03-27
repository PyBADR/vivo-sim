'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { translations } from './translations';

type Lang = 'en' | 'ar';

interface I18nContextValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  toggle: () => void;
  setLang: (lang: Lang) => void;
  t: (section: string, key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('deevo-sim-lang') as Lang | null;
    const browserLang = navigator.language.startsWith('ar') ? 'ar' : 'en';
    const initialLang = savedLang || browserLang;

    setLangState(initialLang);
    document.documentElement.lang = initialLang;
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('deevo-sim-lang', newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'ar' : 'en');
  }, [lang, setLang]);

  const t = useCallback(
    (section: string, key: string): string => {
      const translationsForLang = translations[lang];
      const sectionData = translationsForLang[section as keyof typeof translationsForLang];

      if (!sectionData) {
        console.warn(`Missing translation section: ${section}`);
        return key;
      }

      if (typeof sectionData === 'object' && !Array.isArray(sectionData)) {
        const value = sectionData[key as keyof typeof sectionData];
        if (typeof value === 'string') {
          return value;
        }
        console.warn(`Missing translation: ${section}.${key}`);
        return key;
      }

      console.warn(`Invalid section type: ${section}`);
      return key;
    },
    [lang],
  );

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider
      value={{
        lang,
        dir,
        toggle,
        setLang,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
