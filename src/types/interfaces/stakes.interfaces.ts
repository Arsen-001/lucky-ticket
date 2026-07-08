import type { TicketType } from '@/types/types/ticket.types';
import type { StakeStatus } from '@/types/enums/stakes.enums';

export interface StakeLevelDefinition {
  level: number;
  minDeposit: number;
  /** Tier identity of this stake level — drives accent colour and the AP-tier gate. */
  tier: TicketType;
  /** Stars awarded on full completion = `months × completionStarsPerMonth`. Forfeited on cancel. */
  completionStarsPerMonth: number;
}

export interface ActiveStake {
  id: string;
  level: number;
  lockedAmount: number;
  startDate: string;
  endDate: string;
  status: StakeStatus;
  claimed: boolean;
}

export interface StakeHistoryEntry {
  id: string;
  level: number;
  amount: number;
  /** Stake duration in months — used for restake pre-fill and history display. */
  durationMonths: number;
  /** APR yield paid in LC on completion. */
  yieldLC: number;
  /** Lucky Stars granted on completion (`months × completionStarsPerMonth`; 0 if cancelled). */
  bonusLS: number;
  /** Total Activity Points the stake awarded (base + completion bonus, or base only if cancelled). */
  apAwarded: number;
  outcome: 'completed' | 'cancelled';
  completedAt: string;
}

/** Live economy knobs served with GET /stakes — mirrors the admin config. */
export interface StakesRuntimeConfig {
  aprMinPercent: number;
  aprMaxPercent: number;
  durationMinMonths: number;
  durationMaxMonths: number;
  apDivisor: number;
  apCompletionBonusPercent: number;
}

export interface StakesData {
  /** Admin kill switch — when false the new-stake flow must not render. */
  enabled: boolean;
  config: StakesRuntimeConfig;
  levels: StakeLevelDefinition[];
  activeStakes: ActiveStake[];
  history: StakeHistoryEntry[];
}

export interface StartStakeBody {
  level: number;
  amount: number;
  durationMonths: number;
}

export interface StakeIdBody {
  stakeId: string;
}

/** Response of `POST stakes/claim` — the actual amounts credited by the backend. */
export interface ClaimStakeResult {
  success: boolean;
  id: string;
  /** Original deposit returned to the wallet. */
  principalReturned: number;
  /** APR yield credited in LC. */
  yieldLC: number;
  /** Lucky Stars credited on completion. */
  completionStars: number;
  /** AP completion bonus credited (base AP was credited at stake start). */
  apBonus: number;
}
