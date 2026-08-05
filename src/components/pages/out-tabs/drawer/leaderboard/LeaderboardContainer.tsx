'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useGetLeaderboardQuery } from '@/api/leaderboard.api';
import { useGetMeQuery } from '@/api/me.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLeaderboardEnabled } from '@/hooks/useLeaderboardEnabled';

import { LeaderboardCountUp } from './LeaderboardCountUp';
import { LeaderboardEmptyState } from './LeaderboardEmptyState';
import { LeaderboardErrorState } from './LeaderboardErrorState';
import { LeaderboardHeroCard } from './LeaderboardHeroCard';
import { LeaderboardListItem } from './LeaderboardListItem';
import { LeaderboardLockedState } from './LeaderboardLockedState';
import { LeaderboardPodium, type PodiumPlayer, type PodiumRank } from './LeaderboardPodium';
import {
  PlayerQuickCard,
  type QuickCardPlayer,
} from '@/components/shared/user-elements/PlayerQuickCard';
import type { LeaderboardEntry } from '@/types/interfaces/leaderboard.interfaces';
import { displayNameOf } from '@/utils/global/user.utils';
import { staggerMs } from '@/utils/global/animation.utils';

const COUNT_UP_PLACES = 10;

export function LeaderboardContainer() {
  const t = useAppTranslations();

  const [announcement, setAnnouncement] = useState('');
  const [cardPlayer, setCardPlayer] = useState<QuickCardPlayer | null>(null);
  const [cardOpen, setCardOpen] = useState(false);

  const openCard = (player: QuickCardPlayer) => {
    setCardPlayer(player);
    setCardOpen(true);
  };

  // Master switch (§16.4): while it is off the board is locked, so the query
  // never fires — no standings are fetched, let alone rendered.
  const leaderboardEnabled = useLeaderboardEnabled();

  // Ranking is by lifetime Activity Points (the backend tracks no period
  // windows), so the board is a single all-time list.
  const { data, isLoading, isFetching, isError, error, refetch } = useGetLeaderboardQuery('all', {
    skip: !leaderboardEnabled,
  });
  const { data: me } = useGetMeQuery();

  const places = data?.places ?? [];
  const myPlace = data?.myPlace;

  const rootRef = useRef<HTMLDivElement>(null);
  const [isMyRowVisible, setIsMyRowVisible] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>('[data-leaderboard-me="true"]');
    if (!target) {
      setIsMyRowVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsMyRowVisible(entry.isIntersecting),
      { threshold: 0.6 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [places, isLoading]);

  const showFloatingMyPlace = !!myPlace && !isMyRowVisible;

  const topFive = useMemo<PodiumPlayer[]>(
    () =>
      places.slice(0, 5).map(entry => ({
        rank: entry.place as PodiumRank,
        // A view model — this field is only ever printed, so it carries the
        // shown name (Telegram's, when there is one), not the account handle.
        username: displayNameOf(entry),
        points: entry.points,
        avatarUrl: entry.avatar,
        fallbackInitial: displayNameOf(entry).charAt(0).toUpperCase(),
        isVerified: entry.isVerified,
        isLuckyPlayer: entry.isLuckyPlayer,
        isVIP: entry.isVIP,
        id: entry.id,
        liked: entry.liked,
        likesReceived: entry.likesReceived,
      })),
    [places]
  );
  const restOfList = useMemo(() => places.slice(5), [places]);

  useEffect(() => {
    if (!data) return;
    setAnnouncement(t('top {n}', { n: places.length }));
  }, [data, places.length, t]);

  // After every hook (rules-of-hooks), before any board markup.
  if (!leaderboardEnabled) return <LeaderboardLockedState />;

  // The gate is enforced server-side too, and `/config` is cached — so a
  // session that started while the board was on keeps a stale `true` after an
  // admin switches it off. Without this, the 403 fell through to the generic
  // "failed to load" card whose Retry would 403 forever.
  if (isError && (error as { status?: number })?.status === 403) return <LeaderboardLockedState />;

  if (!isLoading && !isError && places.length === 0) {
    return (
      <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
        <LeaderboardHeroCard myPlace={myPlace} total={data?.total} loading={isLoading} />
        <LeaderboardEmptyState />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <LeaderboardHeroCard myPlace={myPlace} total={data?.total} loading={isLoading} />

      {isError ? (
        <LeaderboardErrorState onRetry={() => refetch()} loading={isFetching} />
      ) : (
        <>
          <LeaderboardPodium
            players={topFive}
            loading={isLoading}
            onOpenCard={openCard}
            meId={me?.id}
          />
          <ListBody
            isLoading={isLoading}
            places={restOfList}
            total={data?.total ?? 0}
            myPlace={myPlace}
            meId={me?.id}
            onOpenCard={openCard}
          />
        </>
      )}

      {showFloatingMyPlace && (
        <div
          aria-label={t('your place')}
          className={twMerge(
            'sticky bottom-2 z-10 -mx-1 mt-1 px-1 backdrop-blur-md',
            'animate-slide-in-bottom'
          )}
        >
          <LeaderboardListItem entry={myPlace} isMe />
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>

      {cardPlayer && (
        <PlayerQuickCard
          key={cardPlayer.userId}
          open={cardOpen}
          onClose={() => setCardOpen(false)}
          {...cardPlayer}
        />
      )}
    </div>
  );
}

interface ListBodyProps {
  isLoading: boolean;
  places: LeaderboardEntry[];
  total: number;
  myPlace?: LeaderboardEntry;
  meId?: string;
  onOpenCard: (player: QuickCardPlayer) => void;
}

function ListBody({ isLoading, places, total, myPlace, meId, onOpenCard }: ListBodyProps) {
  const t = useAppTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const skeletonItems = useMemo(() => Array.from({ length: 12 }), []);

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-background-overlay/40 sticky top-0 z-10 -mx-1 flex items-center gap-2.5 rounded-xl border border-white/5 px-3 py-2 backdrop-blur-md">
        <span className="text-pink-secondary w-9 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider">
          {t('rank')}
        </span>
        <span className="text-pink-secondary flex-1 text-[10px] font-bold uppercase tracking-wider">
          {t('player')}
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex flex-col gap-2 opacity-100"
        role="list"
        aria-busy={isLoading}
      >
        {isLoading
          ? skeletonItems.map((_, index) => (
              <LeaderboardListItem
                key={`s-${index}`}
                loading
                style={{ animationDelay: `${staggerMs(index, 30)}ms` }}
                className="animate-slide-in-bottom"
              />
            ))
          : places.map((entry, index) => {
              const isMe = !!meId && entry.id === meId;
              return (
                <LeaderboardListItem
                  key={entry.id}
                  entry={entry}
                  isMe={isMe}
                  animateCounter={index < COUNT_UP_PLACES}
                  onOpenCard={onOpenCard}
                  className="animate-slide-in-bottom"
                  style={{ animationDelay: `${staggerMs(index, 30)}ms` }}
                />
              );
            })}
      </div>

      {!isLoading && total > 0 && (
        <div className="text-pink-secondary mt-1 text-center text-[11px] font-semibold tabular-nums">
          {myPlace ? (
            <>
              {t('top {n}', { n: places.length })} ·{' '}
              <LeaderboardCountUp value={total} className="tabular-nums" />{' '}
              {t('player').toLowerCase()}
            </>
          ) : (
            t('top {n}', { n: places.length })
          )}
        </div>
      )}
    </div>
  );
}
