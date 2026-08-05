'use client';

import { useGetInvitedFriendsQuery } from '@/api/referral.api';
import { countsAsReferral } from '@/utils/pages/referral.utils';

export interface ReferralCounts {
  /** Everyone who arrived through the link. */
  invited: number;
  /** How many of them are referrals right now — in the channel, bot not blocked. */
  counted: number;
  /** The rest. Zero means the rule is currently costing this player nothing. */
  notCounted: number;
  loading: boolean;
}

/**
 * The friend/referral split, read off the friends list rather than asked for
 * separately.
 *
 * `GET referral/stats` deliberately does NOT answer this. Resolving the roster
 * against Telegram is the expensive half, both endpoints fire together when the
 * screen opens, and on a cold cache both would miss it — a player with 248
 * referrals cost ~496 `getChatMember` calls to render one screen. Deriving here
 * also makes it impossible for the header to disagree with the list under it.
 *
 * Every consumer is on the invite screen, which loads this query anyway, so RTK
 * Query serves all of them from the one cache entry — no extra request.
 */
export function useReferralCounts(): ReferralCounts {
  const { data: friends = [], isLoading } = useGetInvitedFriendsQuery();
  const counted = friends.filter(countsAsReferral).length;

  return {
    invited: friends.length,
    counted,
    notCounted: friends.length - counted,
    loading: isLoading,
  };
}
