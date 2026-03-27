'use client';

import { ReactNode } from 'react';
import { I18nProvider } from '@/lib/i18n';

export function I18nClientWrapper({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
