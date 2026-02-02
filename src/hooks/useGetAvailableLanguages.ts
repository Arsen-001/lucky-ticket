'use client';

import { useLocale } from 'next-intl';
import { Locale } from '@/types/enums/locale.enums';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { LocaleType } from '@/types/types/locale.types';

export interface Language {
  code: LocaleType;
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
    {
      code: Locale.RUSSIAN,
      name: t('russian'),
      nativeName: 'Русский',
    },
  ];

  return {
    languages,
    currentLocale,
  };
}
