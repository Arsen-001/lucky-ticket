import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/de';
import 'dayjs/locale/ru';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { Locale } from '@/types/enums/locale.enums';
import { defaultLocale, locales } from '@/i18n/config';
import type { LocaleType } from '@/types/types/locale.types';

// `L`/`ll`/`LT` — the per-locale date patterns. Without this plugin every
// localized format string renders as the literal letters.
dayjs.extend(localizedFormat);

/**
 * dayjs ships English only; every other locale is an opt-in import. Nothing
 * imported them, so month names were English for everyone and German readers
 * additionally got the American order (`Aug 3` instead of `3. Aug`) — the app
 * was translated, its dates were not.
 *
 * The locale is global dayjs state, which is why it is set from one place on
 * the client (`DayjsLocaleProvider`) rather than per call site.
 */
export const setDayjsLocale = (locale: string): void => {
  const known = (locales as string[]).includes(locale) ? locale : defaultLocale;
  dayjs.locale(known as LocaleType);
};

/**
 * The English month name, whatever the reader's language is.
 *
 * Two screens (notification group headers, "member since") use it as a
 * **translation key** — `t('august')` — not as display text, so they must stay
 * English even after the global locale moves. Reading it through this helper
 * is what keeps a localized `format('MMMM')` from silently turning those
 * headers into raw keys on screen.
 */
export const englishMonthKey = (date: Dayjs): string =>
  date.locale(Locale.ENGLISH).format('MMMM').toLowerCase();
