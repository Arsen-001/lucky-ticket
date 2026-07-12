import { useGetPublicConfigQuery } from '@/api/config.api';
import { GlobalConstants } from '@/constants/global.constants';
import type { TournamentType } from '@/types/types/tournaments.types';

export interface TournamentConfig {
  /** Default top-3 shard rewards; per-tournament overrides take precedence. */
  shardRewards: { first: number; second: number; third: number };
  /** AP granted for joining, by tier (before the LP/VIP boost). */
  joinApByTier: Record<TournamentType, number>;
}

/**
 * Live tournament reward knobs from `GET /config` (admin-editable), falling back
 * to the bundled constants while loading or on an older backend. Display-only —
 * the backend computes the real awards; these drive the reward previews so admin
 * edits reach the UI instead of stale bundled numbers.
 */
export function useTournamentConfig(): TournamentConfig {
  const { data } = useGetPublicConfigQuery();
  return {
    shardRewards: data?.tournaments?.shardRewards ?? GlobalConstants.tournamentShardRewards,
    joinApByTier: (data?.tournaments?.joinApByTier ??
      GlobalConstants.apRewards.tournamentJoinByTier) as Record<TournamentType, number>,
  };
}
