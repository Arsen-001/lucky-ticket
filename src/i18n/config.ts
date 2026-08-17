import { Locale, RTL_LOCALES } from '@/types/enums/locale.enums';
import { LocaleType } from '@/types/types/locale.types';

/**
 * The languages a player can actually be served.
 *
 * **This list is the switch, and it is deliberately shorter than the `Locale`
 * enum.** A locale cookie holding a code that is not here is treated as invalid
 * and falls back to `defaultLocale`; `useTelegramLocale` likewise refuses to
 * seed one. So a language can sit in the enum — typed, wired through the
 * backend, present in the database — while its dictionary is still being
 * written, without a player ever landing on it.
 *
 * That is not a quirk to tidy up later, it is the safety property: next-intl
 * renders the raw key when a message is missing, so promoting a language here
 * before `messages/<code>.json` is complete puts `min length is {num}` on
 * screen in production. **Add a code here only once its dictionary has the full
 * key set** — `tests/i18n.test.ts` enforces parity for every file in
 * `messages/`, so a promoted-too-early language fails the suite rather than
 * reaching anyone.
 *
 * Armenian was the long-standing example of a code sitting in the enum with the
 * switch off — for a year it was in the database purely for Prisma parity, and
 * `tx()` filled it by copying English. It is a real translation now, so it has
 * moved into this list.
 */
export const locales = [
  Locale.ENGLISH,
  Locale.RUSSIAN,
  Locale.GERMAN,
  Locale.ARMENIAN,
  Locale.SPANISH,
  Locale.PORTUGUESE,
  Locale.FRENCH,
  Locale.TURKISH,
  Locale.UKRAINIAN,
  Locale.UZBEK,
  Locale.KAZAKH,
  Locale.KYRGYZ,
  Locale.TAJIK,
  Locale.JAPANESE,
  Locale.KOREAN,
  Locale.CHINESE,
  Locale.ARABIC,
  Locale.PERSIAN,
  Locale.GEORGIAN,
  Locale.AZERBAIJANI,
] as LocaleType[];

export const defaultLocale = Locale.ENGLISH;

export const LOCALE_COOKIE_NAME = 'locale';

/**
 * Reading direction for a locale — what goes in `<html dir>`.
 *
 * Kept next to the locale list rather than in a component so the server layout
 * and any client-side switch answer it the same way.
 */
export const localeDirection = (locale: string): 'rtl' | 'ltr' =>
  (RTL_LOCALES as readonly string[]).includes(locale) ? 'rtl' : 'ltr';
