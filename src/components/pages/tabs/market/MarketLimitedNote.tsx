'use client';

import { Hourglass } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface MarketLimitedNoteProps {
  className?: string;
}

/**
 * What the «Limited» tab collects, said once at the top of it.
 *
 * The tab mixes categories, so without a line the grid reads as an arbitrary
 * subset of the storefront. The rule is one sentence: these leave — by the
 * clock or by the shelf.
 */
export function MarketLimitedNote({ className }: MarketLimitedNoteProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'bg-background-overlay flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2',
        className
      )}
    >
      <Hourglass size={13} strokeWidth={3} className="text-gold shrink-0" />
      <span className="text-pink-secondary min-w-0 text-[12px] leading-tight font-semibold">
        {t('limited note')}
      </span>
    </div>
  );
}
