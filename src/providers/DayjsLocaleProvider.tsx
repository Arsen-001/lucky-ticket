'use client';

import { useLocale } from 'next-intl';
import { setDayjsLocale } from '@/lib/dayjs/locale';
import { setNumberLocale } from '@/utils/global/number.utils';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';

/**
 * Points dayjs AND the number formatters at the reader's language for the whole
 * app.
 *
 * Set during render, not in an effect: children format their dates and numbers
 * in their own render pass, which runs after this one. An effect fires only
 * after the first paint, so every date would flash English and then swap —
 * worse than the bug it fixes.
 *
 * Both live here because both are global module state for the same reason: they
 * are read by plain functions called from hundreds of places that cannot take a
 * locale argument. One provider, one rule, one place to look.
 */
export function DayjsLocaleProvider({ children }: ChildrenProps) {
  const locale = useLocale();
  setDayjsLocale(locale);
  setNumberLocale(locale);
  return children;
}
