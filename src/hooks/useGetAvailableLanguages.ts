'use client';

import { useLocale } from 'next-intl';
import { Locale } from '@/types/enums/locale.enums';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { LocaleType } from '@/types/types/locale.types';
import { flags } from '@/constants/flags.constants';
import { StaticImageData } from 'next/image';

export interface Language {
  code: LocaleType;
  name: string;
  nativeName: string;
  flag: StaticImageData;
}
export function useGetAvailableLanguages() {
  const t = useAppTranslations();
  const currentLocale = useLocale();
  const languages: Language[] = [
    {
      code: Locale.ENGLISH,
      name: t('english'),
      nativeName: 'English',
      flag: flags.unitedKingdom,
    },
    {
      code: Locale.ARMENIAN,
      name: t('armenian'),
      nativeName: 'Հայերեն',
      flag: flags.armenia,
    },
    {
      code: Locale.RUSSIAN,
      name: t('russian'),
      nativeName: 'Русский',
      flag: flags.russia,
    },
  ];

  return {
    languages,
    currentLocale,
  };
}
