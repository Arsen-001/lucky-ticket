import { TEST_QUEST_TOTAL_LEVELS } from '@/constants/testQuest.constants';

/**
 * Permanent engine-speed boost (%) granted by the frozen "Тестировщик" badge,
 * scaled by badge level: +1% (level 31) → +15% (level 1). 0 when not frozen.
 *
 * EXACT mirror of the backend `testBadgeSpeedBoostPct` (backend
 * `test-quest.levels.ts`). The frontend re-derives the effective engine cycle
 * from base values, so it MUST apply the same badge boost the server does —
 * otherwise a badge holder's countdown/readiness drifts from the server: the UI
 * keeps showing a paid "Ускорить" on an engine the backend already treats as
 * ready, and the skip becomes a free no-op (the optimistic star charge reverts).
 * Stacks as a third additive layer on top of the Lucky-Player / VIP boost.
 */
export const testBadgeSpeedBoostPct = (badgeLevel: number | null | undefined): number => {
  if (badgeLevel == null) return 0;
  if (badgeLevel <= 1) return 15;
  if (badgeLevel === 2) return 12;
  if (badgeLevel === 3) return 10;
  if (badgeLevel === 4) return 8;
  const steps = TEST_QUEST_TOTAL_LEVELS - badgeLevel; // level 5 → 26 … level 31 → 0
  return Math.max(1, Math.round(1 + (steps / (TEST_QUEST_TOTAL_LEVELS - 5)) * 6)); // 1..7
};

/**
 * The grand prize of the test quest: whole tickets of permanent CAPACITY on
 * every engine, for EVERY player who finished the daily ladder. It used to be
 * the single level-1 crown; since 19.08.2026 the climb is the price and the
 * leaderboard only decides rank.
 *
 * EXACT mirror of the backend `testBadgeCapacityTickets` — the server mints the
 * batch this size, so a frontend that forgot it would print a smaller collect
 * than the one that lands, and a shorter cycle than the one the server counts.
 *
 * Whole tickets, never a percentage: a capacity % rounds to the same single
 * ticket from level 1 to 16 on any engine below level 2 — the reason the
 * capacity chip pays in tickets too.
 */
export const TEST_BADGE_CAPACITY_TICKETS = 3;

/** Daily ladder floor — levels at or below it are the crown, not claimed daily. */
export const TEST_QUEST_QUALIFY_LEVEL = 4;

/** Claimed the whole daily ladder (31 → floor) — mirror of the backend predicate. */
export const climbedWholeLadder = (climbed: number | null | undefined): boolean =>
  (climbed ?? 0) >= TEST_QUEST_TOTAL_LEVELS - TEST_QUEST_QUALIFY_LEVEL + 1;

/**
 * Reads `climbed`, not the badge level, and the backend does the same: at freeze
 * a player standing ON the floor with 27 claims is stamped level 4 — the same
 * number as one who CLEARED it with 28. A `badgeLevel <= 4` test would show the
 * prize to someone one level short of the finish, and the server would then mint
 * a smaller batch than the screen promised.
 */
export const testBadgeCapacityTickets = (
  badgeLevel: number | null | undefined,
  climbed: number | null | undefined
): number => {
  // Null badge = the test is still running: the prize starts paying at freeze.
  if (badgeLevel == null) return 0;
  return climbedWholeLadder(climbed) ? TEST_BADGE_CAPACITY_TICKETS : 0;
};
