'use client';

import { useLocale } from 'next-intl';
import { setDayjsLocale } from '@/lib/dayjs/locale';
import type { ChildrenProps } from '@/types/interfaces/component.interfcaes';

/**
 * Points dayjs at the reader's language for the whole app.
 *
 * Set during render, not in an effect: children format their dates in their
 * own render pass, which runs after this one. An effect fires only after the
 * first paint, so every date would flash English and then swap — worse than
 * the bug it fixes.
 */
export function DayjsLocaleProvider({ children }: ChildrenProps) {
  setDayjsLocale(useLocale());
  return children;
}
