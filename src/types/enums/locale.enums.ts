/**
 * Every language the platform knows about, lowercase.
 *
 * Must stay in step with the backend's Prisma `Locale` enum, which spells the
 * same codes in UPPERCASE — `tests/enum-parity.test.ts` is the guard on that.
 *
 * Membership here is NOT the same thing as "a player can pick it". This enum is
 * the type-level vocabulary; the selectable list is `locales` in `i18n/config.ts`,
 * and a language stays out of it until its `messages/<code>.json` is complete.
 * Shipping a code here with a half-written dictionary would put raw keys on
 * screen, so the two lists are deliberately allowed to differ.
 */
export enum Locale {
  ENGLISH = 'en',
  ARMENIAN = 'hy',
  RUSSIAN = 'ru',
  GERMAN = 'de',
  SPANISH = 'es',
  PORTUGUESE = 'pt',
  FRENCH = 'fr',
  TURKISH = 'tr',
  UKRAINIAN = 'uk',
  UZBEK = 'uz',
  KAZAKH = 'kk',
  KYRGYZ = 'ky',
  TAJIK = 'tg',
  JAPANESE = 'ja',
  KOREAN = 'ko',
  CHINESE = 'zh',
  ARABIC = 'ar',
  PERSIAN = 'fa',
  GEORGIAN = 'ka',
  AZERBAIJANI = 'az',
}

/**
 * Languages written right-to-left.
 *
 * The app was built left-to-right throughout — physical Tailwind classes
 * (`pl-`, `ml-`, `left-`) rather than logical ones — so this list is what the
 * layout keys off, not a cosmetic detail. Anything added here needs the
 * direction-aware pass, not just a dictionary.
 */
export const RTL_LOCALES: readonly Locale[] = [Locale.ARABIC, Locale.PERSIAN];
