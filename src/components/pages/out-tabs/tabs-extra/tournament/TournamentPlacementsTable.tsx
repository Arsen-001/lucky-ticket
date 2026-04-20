'use client';

import type React from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { twMerge } from 'tailwind-merge';
import type { TournamentPlace } from '@/types/interfaces/tournaments.interfaces';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

interface TournamentPlacementsTableProps {
  places?: TournamentPlace[];
  isLoading?: boolean;
}

const TIER_STYLES: Record<number, { badge: string; row: string }> = {
  1: {
    badge: 'bg-gold/20 text-gold border border-gold/40',
    row: 'bg-gold/5 border-l-2 border-l-gold',
  },
  2: {
    badge: 'bg-silver/20 text-silver border border-silver/40',
    row: 'bg-silver/5 border-l-2 border-l-silver',
  },
  3: {
    badge: 'bg-bronze/20 text-bronze border border-bronze/40',
    row: 'bg-bronze/5 border-l-2 border-l-bronze',
  },
};

const PLACE_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function PlaceRow({
  place,
  prize,
  rank,
  loading,
  style,
}: {
  place: string;
  prize: string;
  rank?: number;
  loading?: boolean;
  style?: React.CSSProperties;
}) {
  const tier = rank && rank <= 3 ? TIER_STYLES[rank] : undefined;
  const medal = rank ? PLACE_MEDALS[rank] : undefined;

  return (
    <div
      className={twMerge(
        'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors',
        tier ? tier.row : 'bg-background-overlay/60'
      )}
      style={style}
    >
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="w-14 rounded-md" />}
      >
        <div
          className={twMerge(
            'flex items-center justify-center min-w-14 px-2 py-0.5 rounded-md text-xs font-bold shrink-0',
            tier ? tier.badge : 'bg-purple-gradient text-white-secondary'
          )}
        >
          {medal ? `${medal} ${place}` : place}
        </div>
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="w-full rounded-md" />}
      >
        <span
          className={twMerge(
            'text-sm truncate',
            tier ? 'text-white font-medium' : 'text-white-secondary'
          )}
        >
          {prize}
        </span>
      </SkeletonSuspense>
    </div>
  );
}

export function TournamentPlacementsTable({ places, isLoading }: TournamentPlacementsTableProps) {
  const t = useAppTranslations();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3 px-3 py-1.5">
        <span className="min-w-14 text-xs font-bold text-white-secondary uppercase tracking-wide">
          {t('place')}
        </span>
        <span className="text-xs font-bold text-white-secondary uppercase tracking-wide">
          {t('prize')}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <PlaceRow key={`loading_${index}`} place="" prize="" loading />
            ))
          : places?.map((item, index) => {
              const displayPlace = item.to ? `${item.from}–${item.to}` : String(item.from);
              const prize = t('{percent} of the total prize pool', { percent: item.percentage });
              const rank = item.to ? undefined : item.from;

              return (
                <PlaceRow
                  key={`place_${index}`}
                  place={displayPlace}
                  prize={prize}
                  rank={rank}
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              );
            })}
      </div>
    </div>
  );
}
