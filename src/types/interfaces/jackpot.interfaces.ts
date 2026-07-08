import type { ActivityTier } from '@/constants/global.constants';

/**
 * Live state of the single global jackpot pot (DOCS §19). The pot grows ONLY
 * when a tournament finishes (its 10% skim, DOCS §20) — the UI shows the real
 * value (polled) and never fakes continuous growth. There is intentionally NO
 * "next draw" / countdown field — the drop moment is secret (admin-charged)
 * and must never leak to the client.
 */
export interface JackpotState {
  /** Current LC in the global pot. */
  pot: number;
  /** Biggest jackpot ever dropped (LC) — the all-time record (a single drop). */
  record: number;
  /** Sum of every jackpot ever paid out to players (LC) — lifetime total, not a single drop. */
  allTimePaidOut: number;
  /** Approx average LC/sec the pot accrues — informational only (no UI creep). */
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
