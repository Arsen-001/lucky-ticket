import type { ActivityTier } from '@/constants/global.constants';

/**
 * Live state of the single global jackpot pot (DOCS §19). The pot creeps up as
 * tournaments feed it (DOCS §20); the page animates it with a live odometer seeded from
 * `accrualPerSecond`. There is intentionally NO "next draw" / countdown field —
 * the drop moment is secret (admin-charged) and must never leak to the client.
 */
export interface JackpotState {
  /** Current LC in the global pot. */
  pot: number;
  /** Biggest jackpot ever dropped (LC) — the all-time record. */
  record: number;
  /** Approx LC the pot accrues per second — drives the live odometer creep. */
  accrualPerSecond: number;
  /** How many active (joined, not-yet-finished) tournaments the player is in. */
  myActiveTournamentsCount: number;
}

/** One past jackpot drop, shown in the "past detonations" feed. */
export interface JackpotWinner {
  id: string;
  /** Total pot that dropped — the row's headline number. */
  potTotal: number;
  /** Tier of the tournament the jackpot was charged to. */
  tier: ActivityTier;
  /** Name of the tournament instance, e.g. "Evening Gold". */
  tournamentName: string;
  /** ISO timestamp of the drop. */
  wonAt: string;
  /** 1st-place winner shown as the "face" of the drop. */
  topWinnerName: string;
  topWinnerAvatar: string;
}
