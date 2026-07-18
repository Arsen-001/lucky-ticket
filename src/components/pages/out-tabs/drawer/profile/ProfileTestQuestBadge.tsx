'use client';

import { useGetTestQuestQuery } from '@/api/testQuest.api';
import { TestQuestBadge } from '@/components/pages/tabs/tasks/TestQuestBadge';

/**
 * Own-profile Test-Quest badge — shows the permanent "Тестировщик · N" mark once
 * the test has ended (badgeLevel set). Renders nothing while the test is live.
 * (Cross-user display will read the level from the profile response later.)
 */
export function ProfileTestQuestBadge() {
  const { data } = useGetTestQuestQuery();
  if (data?.badgeLevel == null) return null;
  return <TestQuestBadge level={data.badgeLevel} />;
}
