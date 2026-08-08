'use client';

import type { CSSProperties } from 'react';
import { Medal } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { getTimeAgo } from '@/utils/global/jackpot.utils';
import type { ActivityTier } from '@/constants/global.constants';
import type { JackpotWinner } from '@/types/interfaces/jackpot.interfaces';

export interface JackpotDropRowProps {
  winner?: JackpotWinner;
  loading?: boolean;
  style?: CSSProperties;
  className?: string;
}

const tierTile: Record<ActivityTier, { bg: string; icon: string }> = {
  bronze: { bg: 'bg-bronze/15', icon: 'text-bronze' },
  silver: { bg: 'bg-silver/15', icon: 'text-silver' },
  gold: { bg: 'bg-gold/15', icon: 'text-gold' },
  platinum: { bg: 'bg-platinum/15', icon: 'text-platinum' },
  diamond: { bg: 'bg-diamond/25', icon: 'text-diamond' },
};

/** One past drop, in the LC transaction row's anatomy: tile · text · amount. */
export function JackpotDropRow({ winner, loading, style, className }: JackpotDropRowProps) {
  const t = useAppTranslations();

  if (loading || !winner) {
    return (
      <div
        style={style}
        className={twMerge(
          'bg-background-overlay/40 flex items-center gap-3 rounded-xl border border-white/5 p-3',
          className
        )}
      >
        <Skeleton variant="round" className="h-9 w-9 flex-shrink-0" />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton variant="line" textSize="sm" className="h-4 w-2/3" />
          <Skeleton variant="line" textSize="xs" className="h-3 w-1/4" />
        </div>
        <Skeleton variant="line" textSize="sm" className="h-4 w-16" />
      </div>
    );
  }

  const tile = tierTile[winner.tier];
  const ago = getTimeAgo(winner.wonAt);

  return (
    <div
      role="listitem"
      style={style}
      className={twMerge(
        'bg-background-overlay/40 hover:bg-background-overlay/70 flex items-center gap-3 rounded-xl border border-white/5 p-3 transition-colors',
        className
      )}
    >
      <div className={twMerge('flex-center h-9 w-9 flex-shrink-0 rounded-xl', tile.bg)}>
        <Medal size={16} strokeWidth={2.4} className={tile.icon} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="line-clamp-2 text-[13px] font-bold leading-tight text-white">
          {winner.tournamentName}
        </span>
        <span className="text-pink-secondary truncate text-[11px]">
          {t('won by {name}', { name: winner.topWinnerName })} ·{' '}
          {ago.key === 'just now' ? t('just now') : t(ago.key, { n: ago.n })}
        </span>
      </div>

      <span className="text-gold inline-flex flex-shrink-0 items-center text-sm font-extrabold tabular-nums">
        {formatNumber(winner.potTotal)}
      </span>
    </div>
  );
}
