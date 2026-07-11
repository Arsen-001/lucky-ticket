import {
  GlobalConstants,
  activityTierOrder,
  computeActivityTier,
  computeDailyBaselineAp,
  type ActivityTier,
} from '@/constants/global.constants';

/**
 * Whether a tier-gated item is unlocked for the player.
 * A tier-`T` item requires the player's tier (AP + referrals gate) to be `T`
 * or higher.
 */
export const isTierUnlocked = (
  activityPoints: number,
  referralsCount: number,
  itemTier: ActivityTier
): boolean =>
  activityTierOrder.indexOf(computeActivityTier(activityPoints, referralsCount)) >=
  activityTierOrder.indexOf(itemTier);

export type ApDecayState = 'active' | 'grace' | 'decaying';

export interface ApDecayInfo {
  state: ApDecayState;
  daysInactive: number;
  /** Days left in the grace period before decay starts (0 once decaying). */
  daysUntilDecay: number;
  /** AP lost per inactive day once decay is active. */
  decayPerDay: number;
}

/**
 * Derives the AP decay status from the user's last activity timestamp.
 * Grace period (no decay) lasts `decayGraceDays`; after that AP drops by
 * `0.5 ×` the player's tier daily baseline per inactive day.
 */
export const computeApDecay = (
  lastActivityAt?: string,
  activityPoints = 0,
  referralsCount = 0,
  now = Date.now()
): ApDecayInfo => {
  const decayPerDay = Math.round(computeDailyBaselineAp(activityPoints, referralsCount) / 2);
  const grace = GlobalConstants.decayGraceDays;

  if (!lastActivityAt) {
    return { state: 'active', daysInactive: 0, daysUntilDecay: grace, decayPerDay };
  }

  const daysInactive = Math.max(
    0,
    Math.floor((now - new Date(lastActivityAt).getTime()) / 86_400_000)
  );

  if (daysInactive >= grace) {
    return { state: 'decaying', daysInactive, daysUntilDecay: 0, decayPerDay };
  }

  return {
    state: daysInactive === 0 ? 'active' : 'grace',
    daysInactive,
    daysUntilDecay: grace - daysInactive,
    decayPerDay,
  };
};
