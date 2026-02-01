'use client';

import { useLocale } from 'next-intl';
import { Locale } from '@/types/enums/locale.enums';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}
export function useGetAvailableLanguages() {
  const t = useAppTranslations();
  const currentLocale = useLocale();
  const languages: Language[] = [
    {
      code: Locale.ENGLISH,
      name: t('english'),
      nativeName: 'English',
    },
    {
      code: Locale.ARMENIAN,
      name: t('armenian'),
      nativeName: 'Հայերեն',
    },
  ];

  const sortedLanguages = [...languages].sort((a, b) => {
    if (a.code === currentLocale) return -1;
    if (b.code === currentLocale) return 1;
    return 0;
  });

  return {
    languages: sortedLanguages,
    currentLocale,
  };
}
