'use client';

import { useGetInvitedFriendsQuery } from '@/api/referral.api';
import { branchLcOf, broughtCountOf, countsAsReferral } from '@/utils/pages/referral.utils';

export interface ReferralCounts {
  /** Everyone who arrived through the link. */
  invited: number;
  /** How many of them are referrals right now — in the channel, bot not blocked. */
  counted: number;
  /** The rest. Zero means the rule is currently costing this player nothing. */
  notCounted: number;
  /**
   * The SECOND level: how many people this player's friends went on to invite,
   * summed. Derived from the same per-friend counts the rows draw their badges
   * from, so the header can never disagree with the list — and the player can
   * check the total by adding up what they see.
   */
  network: number;
  /**
   * What that second level has waiting, in LC — pending, not lifetime. It is
   * claimed through each friend's own button, so this is a headline figure
   * rather than a separate pot with a separate action.
   */
  networkLc: number;
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
    network: friends.reduce((sum, friend) => sum + broughtCountOf(friend), 0),
    // Only what is actually collectable: a branch hanging off a friend who
    // stopped counting is frozen, and a headline that included it would
    // promise money the claim button refuses to pay.
    networkLc: friends
      .filter(countsAsReferral)
      .reduce((sum, friend) => sum + branchLcOf(friend), 0),
    loading: isLoading,
  };
}
