'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import type { LcState } from '@/types/interfaces/lc.interfaces';

export interface LcLifetimeTotalsProps {
  state?: LcState;
  className?: string;
}

/**
 * Lifetime in and out. `GET /lc` has always returned both and the screen showed
 * neither, so the page could answer "how much do I have" but never "how much
 * has this account ever made me". Sits in the history heading rather than in
 * the card: it is a fact about the ledger below, not about the balance above.
 */
export function LcLifetimeTotals({ state, className }: LcLifetimeTotalsProps) {
  const t = useAppTranslations();

  if (!state) return null;

  return (
    <div
      className={twMerge('flex items-center gap-2 text-[11px] font-bold tabular-nums', className)}
    >
      <span className="text-success inline-flex items-center gap-1" title={t('total earned')}>
        <TrendingUp size={11} strokeWidth={3} />
        {formatCompact(state.lifetimeEarned)}
      </span>
      <span aria-hidden className="text-white/20">
        ·
      </span>
      <span className="text-pink-secondary inline-flex items-center gap-1" title={t('total spent')}>
        <TrendingDown size={11} strokeWidth={3} />
        {formatCompact(state.lifetimeSpent)}
      </span>
    </div>
  );
}
