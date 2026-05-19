'use client';

import { Cpu, Crown, MemoryStick } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetTournamentByIdQuery, useGetTournamentPlacesQuery } from '@/api/tournaments.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  LeaderboardPodium,
  type PodiumPlayer,
  type PodiumRank,
} from '@/components/pages/out-tabs/drawer/leaderboard/LeaderboardPodium';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { GlobalConstants } from '@/constants/global.constants';
import type { TournamentType } from '@/types/types/tournaments.types';

const TIER_HEX: Record<TournamentType, string> = {
  bronze: '#AC6122',
  silver: '#A8AAA4',
  gold: '#F8BD3E',
  platinum: '#C0BEB1',
  diamond: '#178D88',
};

const SHARDS_BY_RANK: Record<number, number> = {
  1: GlobalConstants.tournamentShardRewards.first,
  2: GlobalConstants.tournamentShardRewards.second,
  3: GlobalConstants.tournamentShardRewards.third,
};

interface TierRowProps {
  place: string;
  percentage: number;
  lc?: number;
  index: number;
  isMe?: boolean;
}

function TierRow({ place, percentage, lc, index, isMe }: TierRowProps) {
  return (
    <div
      style={{ animationDelay: `${index * 30}ms` }}
      className={twMerge(
        'animate-slide-in-bottom flex items-center gap-2.5 rounded-2xl border p-2.5 transition-all',
        isMe
          ? 'bg-purple-gradient border-electric-pink/55 shadow-[0_0_18px_rgba(222,0,155,0.22)]'
          : 'bg-background-overlay border-white/5 hover:border-white/15'
      )}
    >
      {/* Rank badge */}
      <div
        className={twMerge(
          'flex-center h-9 min-w-9 px-2 flex-shrink-0 rounded-xl text-[11px] font-extrabold tabular-nums text-white border',
          isMe
            ? 'bg-electric-pink/25 border-electric-pink/55'
            : 'bg-purple-gradient border-white/15'
        )}
      >
        {place}
      </div>

      {/* Body — % */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-sm font-bold text-white/85 leading-none">
          {percentage}%
          <LcLabel size={12} />
        </span>
      </div>

      {/* LC reward */}
      <span className="text-gold inline-flex items-center gap-1 text-[13px] font-bold tabular-nums shrink-0">
        <LcLabel size={14} />
        {lc !== undefined ? lc.toLocaleString() : '—'}
      </span>

      {/* Crown — only for the user's row */}
      {isMe && (
        <Crown
          size={16}
          strokeWidth={2.4}
          className="text-electric-pink fill-electric-pink/40 drop-shadow-[0_0_6px_rgba(222,0,155,0.7)] shrink-0"
        />
      )}
    </div>
  );
}

interface TournamentPlacementsProps {
  id: string;
}

export function TournamentPlacements({ id }: TournamentPlacementsProps) {
  const { data: places, isLoading } = useGetTournamentPlacesQuery(id);
  const { data: tournament } = useGetTournamentByIdQuery(id);
  const t = useAppTranslations();

  const ShardIcon = tournament?.shardType === 'capacity' ? MemoryStick : Cpu;
  const prizePool = tournament?.prizePool;
  const userPlace = tournament?.userResult?.place;

  const SHARD_TIER_TEXT: Record<1 | 2 | 3, string> = {
    1: 'text-gold',
    2: 'text-white-secondary',
    3: 'text-bronze',
  };

  // Build podium players from winners + a shard chip as `extra`
  const podiumPlayers: PodiumPlayer[] = (() => {
    if (!places?.places) return [];
    const top3Percentages = new Map<number, number>();
    places.places.forEach(p => {
      if (!p.to && p.from <= 3) top3Percentages.set(p.from, p.percentage);
    });

    return ([1, 2, 3] as const).map(rank => {
      const pct = top3Percentages.get(rank) ?? 0;
      const lc = prizePool ? Math.round((prizePool * pct) / 100) : 0;
      const winner = tournament?.winners?.find(w => w.rank === rank);
      const shards = SHARDS_BY_RANK[rank];
      return {
        rank: rank as PodiumRank,
        username: winner?.username ?? `${rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}`,
        points: lc,
        avatarUrl: winner?.avatar,
        fallbackInitial: winner?.username?.charAt(0).toUpperCase(),
        extra: (
          <span
            className={twMerge(
              'inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[11px] font-extrabold leading-none tabular-nums',
              SHARD_TIER_TEXT[rank]
            )}
          >
            <ShardIcon size={11} strokeWidth={2.4} />+{shards}
          </span>
        ),
      } as PodiumPlayer;
    });
  })();

  const restPlaces = places?.places?.filter(p => p.to || p.from > 3) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {/* Podium — top 3 with shard chips inline next to coins */}
      <LeaderboardPodium
        players={podiumPlayers}
        loading={isLoading}
        maxRank={3}
        confettiVariant="stars"
        confettiColor={tournament?.type ? TIER_HEX[tournament.type] : undefined}
      />

      {/* Rest list */}
      <div className="flex flex-col gap-2">
        <div className="bg-background-overlay/40 flex items-center gap-2.5 rounded-xl border border-white/5 px-3 py-2 backdrop-blur-md">
          <span className="text-pink-secondary w-9 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider">
            {t('rank')}
          </span>
          <span className="text-pink-secondary flex-1 text-[10px] font-bold uppercase tracking-wider">
            {t('prize')}
          </span>
          <LcLabel size={14} className="flex-shrink-0" />
        </div>

        <div className="flex flex-col gap-2">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} variant="rounded-rectangle" className="h-14" />
              ))
            : restPlaces.map((item, index) => {
                const displayPlace = item.to ? `${item.from}–${item.to}` : String(item.from);
                const lc = prizePool ? Math.round((prizePool * item.percentage) / 100) : undefined;
                const isMe =
                  userPlace !== undefined &&
                  userPlace >= item.from &&
                  (item.to ? userPlace <= item.to : userPlace === item.from);
                return (
                  <TierRow
                    key={`${item.from}-${item.to ?? ''}`}
                    place={displayPlace}
                    percentage={item.percentage}
                    lc={lc}
                    index={index}
                    isMe={isMe}
                  />
                );
              })}
        </div>
      </div>
    </div>
  );
}
