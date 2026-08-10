'use client';

import { useMemo } from 'react';
import { useGetTasksQuery } from '@/api/tasks.api';
import type { TaskFrequency } from '@/types/enums/tasks.enums';
import {
  claimableCountsByFrequency,
  claimableTasksRoute,
} from '@/utils/global/tasks-claimable.utils';
import type { Route } from '@/constants/routes';

export interface ClaimableTasks {
  /** Everything collectable on the tasks screen right now (ad views included). */
  total: number;
  byFrequency: Record<TaskFrequency, number>;
  hasAny: boolean;
  /**
   * Where the mark leads — the tasks route aimed at the frequency tab that
   * actually holds the reward. See `claimableTasksRoute`.
   */
  route: Route;
}

/**
 * What the player can collect on the tasks screen, readable from anywhere.
 *
 * It subscribes to `getTasks` on purpose. The point of the mark is to be seen
 * *before* the tasks screen is opened, so a passive read of whatever happens to
 * be in the cache would light up only for players who had already been there —
 * exactly the ones who don't need telling. RTK dedupes the request with the
 * screen's own, and because the tab bar stays mounted the entry stays warm:
 * returning to the tasks tab now shows data instead of a skeleton.
 */
export function useClaimableTasks(): ClaimableTasks {
  const { data } = useGetTasksQuery();

  return useMemo(() => {
    const byFrequency = claimableCountsByFrequency(data);
    const total = Object.values(byFrequency).reduce((sum, count) => sum + count, 0);
    return {
      total,
      byFrequency,
      hasAny: total > 0,
      route: claimableTasksRoute(byFrequency),
    };
  }, [data]);
}
