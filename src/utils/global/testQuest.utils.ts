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
