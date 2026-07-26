'use client';

import { useLocale } from 'next-intl';
import { getLocalizedText } from '@/utils/pages/faq.utils';
import type { LocalizedText } from '@/types/interfaces/faq.interfaces';

/**
 * Render server-authored copy in the active language.
 *
 * Some content is not an i18n key but data — task titles, FAQ articles, legal
 * pages — because it is editable in the admin panel and must ship without a
 * deploy. The backend stores those as `{en,hy,ru,de}` and this picks the right
 * one. A plain string passes through untouched, so a row written before its
 * table was localized still renders instead of going blank.
 */
export function useLocalized() {
  const locale = useLocale();
  return (text: LocalizedText | string | undefined) => getLocalizedText(text, locale);
}
