'use client';

import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { LeaderboardCountUp } from './LeaderboardCountUp';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import type { QuickCardPlayer } from '@/components/shared/user-elements/PlayerQuickCard';
import { routes } from '@/constants/routes';
import type { LeaderboardEntry } from '@/types/interfaces/leaderboard.interfaces';
import type { CSSProperties } from 'react';

export interface LeaderboardListItemProps {
  entry?: LeaderboardEntry;
  loading?: boolean;
  isMe?: boolean;
  animateCounter?: boolean;
  /** Tapping the avatar of another player opens the shared quick-card. */
  onOpenCard?: (player: QuickCardPlayer) => void;
  className?: string;
  style?: CSSProperties;
}

const getInitial = (name?: string) => name?.trim()?.[0]?.toUpperCase() ?? '?';

export function LeaderboardListItem({
  entry,
  loading,
  isMe,
  animateCounter,
  onOpenCard,
  className,
  style,
}: LeaderboardListItemProps) {
  const t = useAppTranslations();

  const handleAvatarTap = () => {
    if (!entry) return;
    onOpenCard?.({
      userId: entry.id,
      username: entry.username,
      avatar: entry.avatar,
      liked: entry.liked,
      likesReceived: entry.likesReceived,
      points: entry.points,
      place: entry.place,
      isVerified: entry.isVerified,
      isLuckyPlayer: entry.isLuckyPlayer,
      isVIP: entry.isVIP,
    });
  };

  const avatarClass = 'relative h-10 w-10 flex-shrink-0 transition-transform active:scale-95';
  const avatarInner = (
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
  );

  return (
    <div
      style={style}
      data-leaderboard-me={isMe ? 'true' : undefined}
      className={twMerge(
        'bg-background-overlay flex items-center gap-2.5 rounded-2xl border px-2.5 py-[3px] transition-all',
        isMe
          ? 'border-electric-pink/55 shadow-[0_0_18px_rgba(222,0,155,0.22)]'
          : 'border-white/5 hover:border-white/15',
        className
      )}
    >
      <RankBadge entry={entry} loading={loading} />

      {isMe ? (
        <Link href={routes.profile.index} className={avatarClass}>
          {avatarInner}
        </Link>
      ) : (
        <button
          type="button"
          className={avatarClass}
          onClick={handleAvatarTap}
          aria-label={entry ? t('open player card', { name: entry.username }) : undefined}
        >
          {avatarInner}
        </button>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-[5px]">
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
            {entry?.isVerified && <VerifiedSparkleIcon size={15} className="shrink-0" />}
            {entry?.isLuckyPlayer && <LuckyPlayerIcon size={15} className="shrink-0" />}
            {entry?.isVIP && <VipIcon size={15} className="shrink-0" />}
          </SkeletonSuspense>
        </div>
        <SkeletonSuspense
          loading={loading || !entry}
          skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-16" />}
        >
          <span className="text-gold inline-flex items-center gap-1 text-[12px] font-bold tabular-nums">
            <BoltIcon size={32} />
            <LeaderboardCountUp value={entry?.points ?? 0} enabled={!!animateCounter} />
          </span>
        </SkeletonSuspense>
      </div>
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

  return (
    <div className="flex-center bg-background-overlay h-9 w-9 flex-shrink-0 rounded-xl border border-white/15 text-sm font-extrabold tabular-nums text-white">
      {entry.place}
    </div>
  );
}
