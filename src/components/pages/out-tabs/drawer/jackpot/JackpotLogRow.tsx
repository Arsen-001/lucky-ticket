'use client';

import type { CSSProperties } from 'react';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';
import { getTimeAgo } from '@/utils/global/jackpot.utils';
import type { JackpotWinner } from '@/types/interfaces/jackpot.interfaces';

interface JackpotLogRowProps {
  winner?: JackpotWinner;
  loading?: boolean;
  style?: CSSProperties;
}

/** One past drop: how much, who took it, when. */
export function JackpotLogRow({ winner, loading, style }: JackpotLogRowProps) {
  const t = useAppTranslations();
  const ago = winner ? getTimeAgo(winner.wonAt) : null;

  return (
    <li
      style={style}
      className="animate-slide-in-bottom flex items-baseline gap-3 border-t border-white/5 py-3 first:border-t-0 first:pt-0"
    >
      <SkeletonSuspense
        loading={loading || !winner}
        skeleton={<Skeleton variant="line" className="h-4 w-full" />}
      >
        {winner && (
          <>
            <span className="text-[14px] font-extrabold tabular-nums text-white">
              {formatCompact(winner.potTotal)} {GlobalConstants.coinName}
            </span>
            <span className="text-white-secondary min-w-0 flex-1 truncate text-[12px] font-medium">
              {t('won by {name}', { name: winner.topWinnerName })}
            </span>
            <span className="flex-shrink-0 text-[11px] font-semibold text-white/30">
              {ago && (ago.key === 'just now' ? t('just now') : t(ago.key, { n: ago.n }))}
            </span>
          </>
        )}
      </SkeletonSuspense>
    </li>
  );
}
