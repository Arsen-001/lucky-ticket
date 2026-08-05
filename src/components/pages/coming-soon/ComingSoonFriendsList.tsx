'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { ComingSoonFriendRow } from '@/components/pages/coming-soon/ComingSoonFriendRow';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';
import { displayNameOf } from '@/utils/global/user.utils';
import { staggerMs } from '@/utils/global/animation.utils';

/** Rows shown while the list loads — enough to read as a list, not as a screen. */
const SKELETON_ROWS = 2;

/**
 * Rows shown before the list folds. This screen's job is the countdown; a
 * prolific inviter's full roster would push the channel link and the language
 * picker dozens of rows down. Everyone is still reachable — the fold opens.
 */
const COLLAPSED_ROWS = 5;

export interface ComingSoonFriendsListProps {
  friends: InvitedFriend[];
  /**
   * Friends that actually count — the ones the channel confirms. Shown over the
   * list as «7 из 10 в канале», i.e. out of the people in THIS list: a roster
   * whose names outnumber the ladder's steps is the moment the rule has to be
   * stated, not the moment to make the player guess it.
   */
  counted?: number;
  /**
   * Ids of friends who arrived but do not count toward the gift yet (not
   * subscribed to the channel). Empty when the backend does not say — an old
   * backend must not paint every friend as uncounted.
   */
  notCountedIds?: string[];
  loading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  className?: string;
}

/**
 * "Who has already joined through your link" on the countdown screen.
 *
 * The empty state is the normal one before launch, so it reads as an invitation
 * rather than as a failure — and a failed fetch says so instead of showing the
 * same emptiness, which here would quietly imply nobody came.
 */
export function ComingSoonFriendsList({
  friends,
  counted,
  notCountedIds,
  loading,
  isError,
  onRetry,
  className,
}: ComingSoonFriendsListProps) {
  const t = useAppTranslations();
  const [expanded, setExpanded] = useState(false);

  const foldable = friends.length > COLLAPSED_ROWS;
  const visible = expanded || !foldable ? friends : friends.slice(0, COLLAPSED_ROWS);
  const notCounted = new Set(notCountedIds ?? []);

  return (
    <div className={twMerge('flex w-full flex-col gap-2', className)}>
      <div className="flex items-center justify-between px-0.5">
        <h3 className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-white/60">
          {t('your friends')}
          {/* Сколько из ПРИШЕДШИХ канал подтвердил — «7 из 10», а не «7 из 7»:
              знаменатель здесь про этот список, а не про планку подарка. Планку
              считает лестница выше, и подменять одно другим значит уверять
              игрока с десятью друзьями, что их семь. */}
          {!loading && !isError && friends.length > 0 && (
            <span className="text-electric-pink rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal tabular-nums">
              {t('coming soon friends in channel', {
                counted: Math.min(counted ?? friends.length, friends.length),
                total: friends.length,
              })}
            </span>
          )}
        </h3>
        {!loading && !isError && foldable && (
          <button
            type="button"
            onClick={() => setExpanded(value => !value)}
            className="text-electric-pink text-[11px] font-bold tabular-nums"
          >
            {expanded ? t('show less') : `${t('see more')} · +${friends.length - COLLAPSED_ROWS}`}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <Skeleton key={index} variant="rounded-rectangle" className="h-[46px] w-full" />
          ))}
        </div>
      ) : isError ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-white-secondary hover:bg-surface-hover rounded-xl border border-white/8 bg-white/4 px-3 py-3 text-center text-xs font-semibold transition-colors active:scale-99"
        >
          {t('couldnt load data')} · <span className="text-electric-pink">{t('retry')}</span>
        </button>
      ) : visible.length ? (
        <div className="flex flex-col gap-2">
          {visible.map((friend, index) => (
            <ComingSoonFriendRow
              key={friend.id}
              username={displayNameOf(friend)}
              avatar={friend.avatar}
              counted={!notCounted.has(friend.id)}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
            />
          ))}
        </div>
      ) : (
        <p className="text-white-secondary rounded-xl border border-dashed border-white/10 px-3 py-3.5 text-center text-xs font-medium leading-relaxed">
          {t('coming soon no friends yet')}
        </p>
      )}
    </div>
  );
}
