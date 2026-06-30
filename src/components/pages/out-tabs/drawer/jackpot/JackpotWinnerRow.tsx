'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants, type ActivityTier } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';
import { getTimeAgo } from '@/utils/global/jackpot.utils';
import type { JackpotWinner } from '@/types/interfaces/jackpot.interfaces';

interface JackpotWinnerRowProps {
  winner?: JackpotWinner;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

const tierChipClass: Record<ActivityTier, string> = {
  bronze: 'bg-bronze/15 text-bronze',
  silver: 'bg-silver/15 text-silver',
  gold: 'bg-gold/15 text-gold',
  platinum: 'bg-platinum/15 text-platinum',
  diamond: 'bg-diamond/15 text-diamond',
};

export function JackpotWinnerRow({ winner, loading, className, style }: JackpotWinnerRowProps) {
  const t = useAppTranslations();

  const ago = winner ? getTimeAgo(winner.wonAt) : null;

  return (
    <div
      style={style}
      role="listitem"
      className={twMerge(
        'bg-background-overlay flex items-center gap-3 rounded-2xl border border-white/5 px-3 py-2.5',
        className
      )}
    >
      <SkeletonSuspense
        loading={loading || !winner}
        skeleton={<Skeleton variant="round" className="h-9 w-9 flex-shrink-0" />}
      >
        {winner &&
          (winner.topWinnerAvatar ? (
            <Image
              src={winner.topWinnerAvatar}
              alt={winner.topWinnerName}
              width={36}
              height={36}
              loading="lazy"
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            // No avatar snapshot — show the name initial instead of an empty src.
            <div className="flex-center bg-electric-purple/30 h-9 w-9 flex-shrink-0 rounded-full text-sm font-extrabold text-white">
              {winner.topWinnerName.charAt(0).toUpperCase()}
            </div>
          ))}
      </SkeletonSuspense>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <SkeletonSuspense
          loading={loading || !winner}
          skeleton={<Skeleton variant="line" className="h-4 w-24" />}
        >
          {winner && (
            <span className="inline-flex items-baseline gap-1.5 text-sm font-extrabold tabular-nums text-white">
              {formatCompact(winner.potTotal)} {GlobalConstants.coinName}
              <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
                {t('dropped')}
              </span>
            </span>
          )}
        </SkeletonSuspense>
        <SkeletonSuspense
          loading={loading || !winner}
          skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-32" />}
        >
          {winner && (
            <span className="text-white-secondary truncate text-[11px] font-medium">
              {t('won by {name}', { name: winner.topWinnerName })} · {winner.tournamentName}
            </span>
          )}
        </SkeletonSuspense>
      </div>

      {winner && (
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span
            className={twMerge(
              'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
              tierChipClass[winner.tier]
            )}
          >
            {t(winner.tier)}
          </span>
          <span className="text-[10px] font-semibold text-white/40">
            {ago && (ago.key === 'just now' ? t('just now') : t(ago.key, { n: ago.n }))}
          </span>
        </div>
      )}
    </div>
  );
}
