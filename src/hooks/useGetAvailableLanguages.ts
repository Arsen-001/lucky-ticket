'use client';

import { useLocale } from 'next-intl';
import { Locale } from '@/types/enums/locale.enums';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { LocaleType } from '@/types/types/locale.types';
import { locales } from '@/i18n/config';
import { flags } from '@/constants/flags.constants';
import { StaticImageData } from 'next/image';

export interface Language {
  code: LocaleType;
  name: string;
  nativeName: string;
  flag: StaticImageData;
}

/**
 * How each language presents itself: its own name, and a flag.
 *
 * Keyed by every member of `Locale`, not just the live ones, so a language that
 * is typed and translated but not yet promoted in `i18n/config.ts` already has
 * its row waiting — promoting it stays a one-line change in one file.
 *
 * `Record<Locale, …>` rather than an array on purpose: this used to be a
 * hand-written list of three, i.e. a second copy of the locale list that could
 * drift from the real one. Now the switcher is derived from `locales` below and
 * the compiler refuses a new enum member until it has a row here.
 *
 * On flags: a flag is a country, a language is not, so a few are judgement
 * calls rather than facts — English shows the UK, Portuguese shows Brazil
 * (pt-BR is the variant we translate), Arabic shows Saudi Arabia. The player
 * reads them as icons, and `nativeName` is the actual label.
 */
/**
 * A key `t()` will accept. Taken from the translator itself rather than widened
 * to `string`, so a language whose name key is missing from `messages/en.json`
 * fails the build here instead of rendering the raw key in the switcher.
 */
type MessageKey = Parameters<ReturnType<typeof useAppTranslations>>[0];

const LANGUAGE_PRESENTATION: Record<
  Locale,
  { nameKey: MessageKey; nativeName: string; flag: StaticImageData }
> = {
  [Locale.ENGLISH]: { nameKey: 'english', nativeName: 'English', flag: flags.unitedKingdom },
  [Locale.RUSSIAN]: { nameKey: 'russian', nativeName: 'Русский', flag: flags.russia },
  [Locale.GERMAN]: { nameKey: 'german', nativeName: 'Deutsch', flag: flags.germany },
  [Locale.ARMENIAN]: { nameKey: 'armenian', nativeName: 'Հայերեն', flag: flags.armenia },
  [Locale.SPANISH]: { nameKey: 'spanish', nativeName: 'Español', flag: flags.spain },
  [Locale.PORTUGUESE]: { nameKey: 'portuguese', nativeName: 'Português', flag: flags.brazil },
  [Locale.FRENCH]: { nameKey: 'french', nativeName: 'Français', flag: flags.france },
  [Locale.TURKISH]: { nameKey: 'turkish', nativeName: 'Türkçe', flag: flags.turkey },
  [Locale.UKRAINIAN]: { nameKey: 'ukrainian', nativeName: 'Українська', flag: flags.ukraine },
  [Locale.UZBEK]: { nameKey: 'uzbek', nativeName: 'Oʻzbekcha', flag: flags.uzbekistan },
  [Locale.KAZAKH]: { nameKey: 'kazakh', nativeName: 'Қазақша', flag: flags.kazakhstan },
  [Locale.KYRGYZ]: { nameKey: 'kyrgyz', nativeName: 'Кыргызча', flag: flags.kyrgyzstan },
  [Locale.TAJIK]: { nameKey: 'tajik', nativeName: 'Тоҷикӣ', flag: flags.tajikistan },
  [Locale.JAPANESE]: { nameKey: 'japanese', nativeName: '日本語', flag: flags.japan },
  [Locale.KOREAN]: { nameKey: 'korean', nativeName: '한국어', flag: flags.southKorea },
  [Locale.CHINESE]: { nameKey: 'chinese', nativeName: '中文', flag: flags.china },
  [Locale.ARABIC]: { nameKey: 'arabic', nativeName: 'العربية', flag: flags.saudiArabia },
  [Locale.PERSIAN]: { nameKey: 'persian', nativeName: 'فارسی', flag: flags.iran },
  [Locale.GEORGIAN]: { nameKey: 'georgian', nativeName: 'ქართული', flag: flags.georgia },
  [Locale.AZERBAIJANI]: {
    nameKey: 'azerbaijani',
    nativeName: 'Azərbaycanca',
    flag: flags.azerbaijan,
  },
};

export function useGetAvailableLanguages() {
  const t = useAppTranslations();
  const currentLocale = useLocale();

  // Order follows `locales`, so the switcher and the "is this language live"
  // check can never disagree about what exists.
  const languages: Language[] = locales.map(code => {
    const { nameKey, nativeName, flag } = LANGUAGE_PRESENTATION[code as Locale];
    return { code, name: t(nameKey), nativeName, flag };
  });

  return {
    languages,
    currentLocale,
  };
}
