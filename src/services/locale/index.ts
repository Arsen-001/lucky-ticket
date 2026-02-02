import { locales } from '@/i18n/config';
import { type LocaleType } from '@/types/types/locale.types';

export const isLocaleValid = (locale?: string) => locales.includes(locale as LocaleType);
export * from './locale-server.service';
