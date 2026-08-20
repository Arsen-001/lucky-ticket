import { useGetPublicConfigQuery } from '@/api/config.api';
import { GlobalConstants } from '@/constants/global.constants';

export interface InviteRewardsDisplay {
  ap: number;
  stars: number;
  /** What the same invite pays when the friend has Telegram Premium. */
  premiumAp: number;
  premiumStars: number;
  /**
   * Стоит ли вообще заводить речь о Premium.
   *
   * Пара `premium*` ЗАМЕНЯЕТ обычную, а не добавляется к ней, поэтому равные
   * значения — это «бонуса нет». Ровно так конфиг стоял с 06.08 по 20.08.2026,
   * и всё это время экран мог бы обещать удвоение, которого не происходит.
   * Отсюда единственная развязка: строка про Premium рисуется, только когда
   * числа действительно больше — выключить бонус можно двумя цифрами в панели,
   * и экран замолкает сам.
   */
  hasPremiumBonus: boolean;
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

  const ap = signup?.ap ?? GlobalConstants.inviteActivityPoints;
  const stars = signup?.stars ?? GlobalConstants.inviteStars;
  const premiumAp = signup?.premiumAp ?? GlobalConstants.invitePremiumActivityPoints;
  const premiumStars = signup?.premiumStars ?? GlobalConstants.invitePremiumStars;

  return {
    ap,
    stars,
    premiumAp,
    premiumStars,
    hasPremiumBonus: premiumAp > ap || premiumStars > stars,
    hasRewardLadder: data?.referral?.hasRewardLadder ?? false,
  };
}
