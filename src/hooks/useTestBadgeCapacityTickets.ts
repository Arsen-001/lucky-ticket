import { useGetTestQuestQuery } from '@/api/testQuest.api';
import { testBadgeCapacityTickets } from '@/utils/global/testQuest.utils';

/**
 * Permanent capacity tickets from the frozen "Тестировщик" badge — the test
 * quest's grand prize, paid to every player who finished the daily ladder and 0
 * for everyone who stopped short.
 *
 * Pass the result as `badgeCapacityTickets` to `engineCapacity` /
 * `effectiveCycleSeconds` wherever a batch or a cycle is computed, next to
 * `badgeBoostPct`: the server adds these tickets to the batch it actually mints,
 * so a screen that omits them shows a smaller collect than the one that lands
 * (and, since one ticket costs one tier cycle, a shorter countdown than the one
 * the server is counting).
 */
export const useTestBadgeCapacityTickets = (): number => {
  // Scoped to the two fields the prize depends on, like
  // `useTestBadgeSpeedBoostPct`: the rest of the test-quest payload changes far
  // more often and would re-render every engine cube for nothing. Both are
  // frozen once the badge is minted, so this selector settles for good.
  const { badgeLevel, climbed } = useGetTestQuestQuery(undefined, {
    selectFromResult: ({ data }) => ({
      badgeLevel: data?.badgeLevel ?? null,
      climbed: data?.climbed ?? 0,
    }),
  });
  return testBadgeCapacityTickets(badgeLevel, climbed);
};
