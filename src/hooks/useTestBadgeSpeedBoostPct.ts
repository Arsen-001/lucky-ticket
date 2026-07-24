import { useGetTestQuestQuery } from '@/api/testQuest.api';
import { testBadgeSpeedBoostPct } from '@/utils/global/testQuest.utils';

/**
 * Permanent engine-speed boost % from the frozen "Тестировщик" badge (0 while
 * the test is live or the player never earned a badge). Pass the result as
 * `effectiveCycleSeconds`'s `badgeBoostPct` wherever a cycle is computed,
 * alongside `avatarBoostPct` / `isLuckyPlayer` / `isVip` — the backend applies
 * this same boost to readiness and skip cost, so omitting it drifts the UI.
 */
export const useTestBadgeSpeedBoostPct = (): number => {
  // Scope the subscription to badgeLevel only — the rest of the test-quest
  // payload changes far more often and would needlessly re-render engine cubes.
  const { badgeLevel } = useGetTestQuestQuery(undefined, {
    selectFromResult: ({ data }) => ({ badgeLevel: data?.badgeLevel ?? null }),
  });
  return testBadgeSpeedBoostPct(badgeLevel);
};
