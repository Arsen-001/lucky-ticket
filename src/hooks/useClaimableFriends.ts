'use client';

import { useMemo } from 'react';
import { useGetInvitedFriendsQuery } from '@/api/referral.api';
import {
  claimableFriendsCount,
  countsAsReferral,
  totalClaimableLcOf,
} from '@/utils/pages/referral.utils';

export interface ClaimableFriends {
  /** How many friends have something waiting — the badge number. */
  count: number;
  /** What they pay in LC, summed. Frozen rewards are not in it. */
  lc: number;
  hasAny: boolean;
  loading: boolean;
}

/**
 * What is waiting on the friends screen, readable from anywhere.
 *
 * The referral reward has always been claimed one screen deep in the drawer,
 * and nothing outside that screen said it was there: the burger dot counted
 * unread notifications and matured stakes, the drawer badged stakes only, and
 * the «Друзья» shortcut on the LC / activity / jackpot cards carried no mark at
 * all. A player with LC sitting on three friends had to go and look.
 *
 * Subscribes to `getInvitedFriends` on purpose, exactly like `useClaimableTasks`
 * subscribes to the tasks: the point of the mark is to be seen BEFORE the screen
 * is opened, so a passive read of whatever happens to be cached would light up
 * only for players who had already been there — the ones who need no telling.
 * RTK dedupes it with the friends screen's own query, and the header stays
 * mounted, so the header, the drawer and the screen share ONE request.
 */
export function useClaimableFriends(): ClaimableFriends {
  const { data: friends, isLoading } = useGetInvitedFriendsQuery();

  return useMemo(() => {
    const count = claimableFriendsCount(friends);
    return {
      count,
      // The same sum the screen's own claim-all card shows: LC is payable only
      // while the friend still counts as a referral, so a frozen reward is not
      // in this figure even when its friend is in the count for leftover
      // tickets. @see FriendsClaimSummaryCard
      lc: (friends ?? [])
        .filter(countsAsReferral)
        .reduce((sum, friend) => sum + totalClaimableLcOf(friend), 0),
      hasAny: count > 0,
      loading: isLoading,
    };
  }, [friends, isLoading]);
}
