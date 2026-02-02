import { Locale } from '@/types/enums/locale.enums';
import { LocaleType } from '@/types/types/locale.types';

export const locales = Object.values(Locale) as LocaleType[];

export const defaultLocale = Locale.ENGLISH;

export const LOCALE_COOKIE_NAME = 'locale';
