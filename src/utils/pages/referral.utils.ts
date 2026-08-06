import { GlobalConstants } from '@/constants/global.constants';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';

/**
 * Does this friend count as a referral right now?
 *
 * `undefined` reads as YES on purpose. The field arrived with the channel rule;
 * a backend that predates it (or a cached response from one) says nothing, and
 * treating silence as "not counted" would paint every friend on the screen as
 * disqualified the moment the frontend ships ahead of the backend. Only an
 * explicit `false` demotes someone.
 */
export const countsAsReferral = (friend: Pick<InvitedFriend, 'countsAsReferral'>): boolean =>
  friend.countsAsReferral !== false;

/**
 * The referral reward waiting on a friend, in LC.
 *
 * `undefined` reads as zero — a backend that predates the reward says nothing,
 * and rendering `NaN` or `undefined LC` in a money row is worse than showing
 * the row with nothing to claim. @see InvitedFriend.claimableLc
 */
export const claimableLcOf = (friend?: Pick<InvitedFriend, 'claimableLc'>): number =>
  friend?.claimableLc ?? 0;

/**
 * Telegram Mini App invite link. Opening `t.me/<bot>?startapp=<refererId>`
 * launches the app and delivers `<refererId>` as `start_param` inside initData,
 * which the backend reads on the friend's first sign-in to record the referral
 * and reward the inviter. A plain web URL can't carry `start_param`, so the
 * referral would never register.
 */
export const getRefererLink = (refererId?: string) => {
  if (!refererId) return '';
  return `${GlobalConstants.telegramBotUrl}?startapp=${refererId}`;
};
