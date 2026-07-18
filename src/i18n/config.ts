import { Locale } from '@/types/enums/locale.enums';
import { LocaleType } from '@/types/types/locale.types';

// Armenian (Locale.ARMENIAN) is kept in the enum for backend Prisma parity but
// is intentionally not offered as a selectable app language. An `hy` locale
// cookie is treated as invalid and falls back to `defaultLocale`.
export const locales = [Locale.ENGLISH, Locale.RUSSIAN, Locale.GERMAN] as LocaleType[];

export const defaultLocale = Locale.ENGLISH;

export const LOCALE_COOKIE_NAME = 'locale';
