import { TEST_QUEST_TOTAL_LEVELS } from '@/constants/testQuest.constants';

/**
 * Permanent engine-speed boost (%) granted by the frozen "Тестировщик" badge.
 *
 * **Always 0 since 19.08.2026: the badge grants exactly one thing — permanent
 * bronze capacity.** It used to scale by badge level (+1% at 31 … +15% at 1).
 *
 * EXACT mirror of the backend `testBadgeSpeedBoostPct`, and it has to stay one:
 * the app re-derives the effective engine cycle from base values, so any badge
 * boost the server applies must be applied here too. When these two drifted
 * before, a badge holder saw a paid "Ускорить" on an engine the backend already
 * considered ready, and the skip became a free no-op.
 */
export const testBadgeSpeedBoostPct = (_badgeLevel: number | null | undefined): number => 0;

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

/**
 * Daily ladder floor — mirror of the backend constant. 1 since 19.08.2026: the
 * crown is gone, so every level down to 1 is claimed by doing its tasks and
 * "finished the ladder" means all 31.
 */
export const TEST_QUEST_QUALIFY_LEVEL = 1;

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
