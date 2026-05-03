'use client';

import Image from 'next/image';
import { ArrowDown, ArrowUp, Minus, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { VerifiedBadge } from '@/components/shared/badges/VerifiedBadge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { LeaderboardCountUp } from './LeaderboardCountUp';
import { Crown, Star } from 'lucide-react';
import type { LeaderboardEntry } from '@/types/interfaces/leaderboard.interfaces';
import type { CSSProperties } from 'react';

export interface LeaderboardListItemProps {
  entry?: LeaderboardEntry;
  loading?: boolean;
  isMe?: boolean;
  animateCounter?: boolean;
  className?: string;
  style?: CSSProperties;
}

const getInitial = (name?: string) => name?.trim()?.[0]?.toUpperCase() ?? '?';

export function LeaderboardListItem({
  entry,
  loading,
  isMe,
  animateCounter,
  className,
  style,
}: LeaderboardListItemProps) {
  const t = useAppTranslations();
  const change = entry?.rankChange ?? 0;
  const positive = change > 0;
  const negative = change < 0;
  const isTop3 = !!entry && entry.place <= 3;

  return (
    <div
      style={style}
      data-leaderboard-me={isMe ? 'true' : undefined}
      className={twMerge(
        'bg-background-overlay flex items-center gap-2.5 rounded-2xl border p-2.5 transition-all',
        isMe
          ? 'bg-purple-gradient border-electric-pink/55 shadow-[0_0_18px_rgba(222,0,155,0.22)]'
          : isTop3
            ? 'border-gold/35 hover:border-gold/55'
            : 'border-white/5 hover:border-white/15',
        className
      )}
    >
      <RankBadge entry={entry} loading={loading} />

      <div className="relative h-10 w-10 flex-shrink-0">
        <SkeletonSuspense
          loading={loading || !entry}
          skeleton={<Skeleton variant="round" className="h-full w-full" />}
        >
          {entry?.avatar ? (
            <Image
              src={entry.avatar}
              alt={entry.username}
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex-center bg-electric-purple/20 text-electric-purple h-10 w-10 rounded-full text-sm font-extrabold">
              {getInitial(entry?.username)}
            </div>
          )}
        </SkeletonSuspense>
        {entry?.isVIP && (
          <span
            className="bg-pink-gradient border-background-overlay absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2"
            aria-label="VIP"
          >
            <Star size={6} className="fill-white text-white" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <SkeletonSuspense
            loading={loading || !entry}
            skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-24" />}
          >
            <span
              className={twMerge(
                'truncate text-sm font-bold',
                isMe ? 'text-white' : 'text-white/90'
              )}
            >
              {entry?.username}
            </span>
            {isMe && (
              <span className="bg-electric-pink/30 ml-0.5 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                {t('you')}
              </span>
            )}
            {entry?.isVerified && (
              <VerifiedBadge
                hideText
                className="h-4 w-4 flex-shrink-0 p-0"
                classNames={{ icon: 'h-3 w-3' }}
              />
            )}
            {entry?.isPrime && (
              <Crown size={11} className="text-electric-purple flex-shrink-0" strokeWidth={2.4} />
            )}
          </SkeletonSuspense>
        </div>
        <SkeletonSuspense
          loading={loading || !entry}
          skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-16" />}
        >
          <span className="text-gold inline-flex items-center gap-1 text-[12px] font-bold tabular-nums">
            <Zap size={11} className="fill-gold" />
            <LeaderboardCountUp value={entry?.points ?? 0} enabled={!!animateCounter} />
          </span>
        </SkeletonSuspense>
      </div>

      <SkeletonSuspense
        loading={loading || !entry}
        skeleton={<Skeleton variant="rounded-rectangle" className="h-6 w-10" />}
      >
        <span
          aria-label={
            positive
              ? t('rank up by {n}', { n: change })
              : negative
                ? t('rank down by {n}', { n: Math.abs(change) })
                : t('rank unchanged')
          }
          className={twMerge(
            'inline-flex flex-shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold tabular-nums',
            positive
              ? 'bg-success/15 text-success'
              : negative
                ? 'bg-error/15 text-error'
                : 'bg-white/5 text-white/55'
          )}
        >
          {positive ? (
            <ArrowUp size={10} strokeWidth={3} />
          ) : negative ? (
            <ArrowDown size={10} strokeWidth={3} />
          ) : (
            <Minus size={10} strokeWidth={3} />
          )}
          {Math.abs(change)}
        </span>
      </SkeletonSuspense>
    </div>
  );
}

interface RankBadgeProps {
  entry?: LeaderboardEntry;
  loading?: boolean;
}

function RankBadge({ entry, loading }: RankBadgeProps) {
  if (loading || !entry) {
    return <Skeleton variant="round" className="h-9 w-9 flex-shrink-0" />;
  }

  const place = entry.place;

  if (place === 1) {
    return (
      <div className="flex-center h-9 w-9 flex-shrink-0">
        <Medal type="gold" width={32} height={32} />
      </div>
    );
  }
  if (place === 2) {
    return (
      <div className="flex-center h-9 w-9 flex-shrink-0">
        <Medal type="silver" width={32} height={32} />
      </div>
    );
  }
  if (place === 3) {
    return (
      <div className="flex-center h-9 w-9 flex-shrink-0">
        <Medal type="bronze" width={32} height={32} />
      </div>
    );
  }

  return (
    <div className="flex-center bg-purple-gradient h-9 w-9 flex-shrink-0 rounded-xl border border-white/15 text-sm font-extrabold tabular-nums text-white">
      {place}
    </div>
  );
}
