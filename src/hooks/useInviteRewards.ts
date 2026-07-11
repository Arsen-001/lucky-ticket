import { useGetPublicConfigQuery } from '@/api/config.api';
import { GlobalConstants } from '@/constants/global.constants';

export interface InviteRewardsDisplay {
  ap: number;
  stars: number;
  premiumAp: number;
  premiumStars: number;
  /** True when the admin per-invite ladder replaces the flat reward — the
   *  flat numbers below are then NOT what the next invite actually pays. */
  hasRewardLadder: boolean;
}

/**
 * Live invite-reward display values from `GET /config` (admin-editable),
 * falling back to the bundled constants while loading or on an older backend.
 * The backend stays authoritative on what registerReferral actually credits.
 */
export function useInviteRewards(): InviteRewardsDisplay {
  const { data } = useGetPublicConfigQuery();
  const signup = data?.referral?.signup;
  return {
    ap: signup?.ap ?? GlobalConstants.inviteActivityPoints,
    stars: signup?.stars ?? GlobalConstants.inviteStars,
    premiumAp: signup?.premiumAp ?? GlobalConstants.inviteTelegramPremiumActivityPoints,
    premiumStars: signup?.premiumStars ?? GlobalConstants.inviteTelegramPremiumStars,
    hasRewardLadder: data?.referral?.hasRewardLadder ?? false,
  };
}
