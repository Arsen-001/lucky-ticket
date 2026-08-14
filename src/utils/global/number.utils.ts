import { defaultLocale, locales } from '@/i18n/config';
import type { LocaleType } from '@/types/types/locale.types';

export const getRandomNumber = (min: number = 0, max: number = 9) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * The language every number on screen is formatted in.
 *
 * Module-level rather than a hook, for the same reason dayjs's locale is —
 * these formatters are plain functions called from ~30 files, most of them deep
 * inside render trees that have no business taking a locale parameter. It is
 * set once per render from `NumberLocaleProvider`, which sits beside
 * `DayjsLocaleProvider` and follows the identical rule.
 */
let activeLocale: LocaleType = defaultLocale;

/**
 * Every formatter, for every language, built once and reused.
 *
 * `Intl.NumberFormat` construction is the expensive part — it parses the locale
 * data — and these run inside lists that re-render on every tick of a
 * countdown. Constructing per call turned a cheap `toLocaleString` into a
 * measurable cost; the cache keeps it at one construction per language.
 */
const cache = new Map<string, Intl.NumberFormat>();

/**
 * Latin digits, always — in every language, including Arabic and Persian.
 *
 * `Intl` would otherwise hand an Arabic reader `١٢٣٤` for a balance of 1234,
 * because that is the default numbering system for `ar`. Deliberate decision:
 * the separators follow the language (a German sees `1.234,56`), the digits do
 * not. A player comparing their LC balance against a leaderboard, a price tag
 * and a Telegram Stars invoice should not have to read three digit systems, and
 * the numerals in the game's own art are Latin.
 */
const formatter = (options: Intl.NumberFormatOptions = {}): Intl.NumberFormat => {
  const key = `${activeLocale}:${JSON.stringify(options)}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const made = new Intl.NumberFormat(activeLocale, { numberingSystem: 'latn', ...options });
  cache.set(key, made);
  return made;
};

/** Point every number formatter at the reader's language. */
export const setNumberLocale = (locale: string): void => {
  activeLocale = ((locales as string[]).includes(locale) ? locale : defaultLocale) as LocaleType;
};

export const formatNumber = (value: number) => formatter().format(value);

export const formatCompact = (value: number) =>
  formatter({ notation: 'compact', maximumFractionDigits: 1 }).format(value);

/**
 * Ticket-production rate (per hour / per day). Sub-1 rates must keep their
 * fraction — a base bronze engine mints 0.5 T/H and rounding it up to "1"
 * doubles the promised output — while a maxed engine's per-day figure runs into
 * the hundreds, where two decimals are noise.
 */
export const formatTicketRate = (value: number) => {
  const rate = Math.max(0, value);
  if (rate >= 100)
    return formatter({ notation: 'compact', maximumFractionDigits: 1 }).format(Math.round(rate));
  if (rate >= 1) return formatter({ maximumFractionDigits: 1 }).format(Math.round(rate * 10) / 10);
  return formatter({ maximumFractionDigits: 2 }).format(Math.round(rate * 100) / 100);
};

// Compact notation that keeps up to 2 fraction digits, so a price like 1250
// reads as "1.25K" instead of the over-rounded "1.3K". Used for Market prices.
export const formatCompactPrice = (value: number) =>
  formatter({ notation: 'compact', maximumFractionDigits: 2 }).format(value);
