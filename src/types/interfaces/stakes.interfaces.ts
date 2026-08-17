import type { TicketType } from '@/types/types/ticket.types';
import type { StakeStatus } from '@/types/enums/stakes.enums';

/**
 * A deposit BAND. `level` is derived from the amount and nothing else — there
 * is no level to pick, and no tier gate on reaching one. A deposit below the
 * cheapest band's `minDeposit` has no level at all (`level: 0` on a stake).
 */
export interface StakeLevelDefinition {
  level: number;
  minDeposit: number;
  /**
   * Band identity — accent colour and label only. Gates nothing.
   *
   * Nullable on purpose: the server names a band by indexing its five shipped
   * tiers (`STAKE_LEVELS[level - 1]`), while the band LIST comes from the admin
   * config and may be longer. A sixth band therefore arrives with `tier: null`,
   * and every surface has to paint it neutral rather than emit
   * `var(--color-null)` and lose its border.
   */
  tier: TicketType | null;
  /** Stars awarded on full completion = `months × completionStarsPerMonth`. Forfeited on cancel. */
  completionStarsPerMonth: number;
  /** Percentage points added onto the duration APR inside this band. */
  yieldBoostPct: number;
}

export interface ActiveStake {
  id: string;
  /** Deposit band, or `0` when the deposit cleared none. */
  level: number;
  lockedAmount: number;
  /**
   * The duration the stake was actually opened for — the number the server
   * charges and pays by. Optional only for an older backend that predates the
   * field; `stakeDurationMonths()` falls back to deriving it from the dates.
   */
  durationMonths?: number;
  startDate: string;
  endDate: string;
  /** Server's verdict on maturity, so a wrong device clock can't claim early. */
  matured?: boolean;
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
  /**
   * Activity Points the stake awarded: base + completion bonus when it ran to
   * the end. On a CANCELLED stake this still carries the base the server
   * stamped at start — the row is never zeroed on cancel — but that AP was
   * revoked, so no screen may present it as earned (DOCS §18.3).
   */
  apAwarded: number;
  outcome: 'completed' | 'cancelled';
  /** Nullable: the server serialises `completedAt?.toISOString()`. */
  completedAt: string | null;
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
  /**
   * Sent for older-server compatibility only — the server re-derives the band
   * from `amount` and ignores whatever is claimed here.
   */
  level: number;
  amount: number;
  durationMonths: number;
}

export interface StakeIdBody {
  stakeId: string;
}

/**
 * Response of `POST stakes/start` — what the server actually opened.
 *
 * The band and the end date are the server's, not the form's: it re-derives the
 * level from the amount, so a config change between page load and confirm would
 * otherwise leave the "stake opened" screen quoting a level the stake does not
 * have.
 */
export interface StartStakeResult {
  success: boolean;
  id: string;
  /** The band the server settled on — `0` when the deposit cleared none. */
  level: number;
  lockedAmount: number;
  endDate: string;
  /** Stars actually charged (0 when the free-start waiver applied). */
  feeStars: number;
  /** Base AP credited at start. */
  apAwarded: number;
}

/** Response of `POST stakes/cancel` — the principal back, and what it cost. */
export interface CancelStakeResult {
  success: boolean;
  id: string;
  principalReturned: number;
  cancelFeeStars: number;
  /** Base AP taken back off the balance (DOCS §18.3). */
  apRevoked: number;
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
