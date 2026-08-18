import {
  GlobalConstants,
  activityTierOrder,
  computeActivityTier,
  computeDailyBaselineAp,
  type ActivityTier,
} from '@/constants/global.constants';
import type { Dictionary } from '@/types/types/i18n.types';

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

export interface TierGap {
  /** AP still missing for the tier — 0 once that half of the gate is met. */
  apGap: number;
  /** Invited friends still missing for the tier — 0 once that half is met. */
  refGap: number;
}

/**
 * The tier gate stated as what is still missing (DOCS §5.1). Both halves are
 * returned because either one alone keeps the tier locked: naming only the AP
 * half is how a gated stake ended up telling the player "need 0 more AP" while
 * refusing to open — the friends half was the one blocking.
 */
export const computeTierGap = (
  activityPoints: number,
  referralsCount: number,
  tier: ActivityTier
): TierGap => ({
  apGap: Math.max(0, GlobalConstants.apTierThresholds[tier] - activityPoints),
  refGap: Math.max(0, GlobalConstants.tierReferralRequirements[tier] - referralsCount),
});

/**
 * The gap as one short line: "Need 3 friends · More AP needed". Friends lead —
 * AP keeps accruing on its own, invites never do — and a met half is dropped
 * rather than printed as a zero.
 *
 * The AP half is stated WITHOUT its number, here and everywhere else the gate
 * is drawn (@see ActivityGateBand): the friends requirement is a thing the
 * player acts on and is named in full, while the AP threshold is not published
 * — it is a live ladder, and a number on screen is a promise that retuning it
 * breaks.
 */
export const formatTierGap = (gap: TierGap, t: Dictionary): string =>
  [
    gap.refGap > 0 ? t('need {n} friends', { n: gap.refGap }) : null,
    gap.apGap > 0 ? t('need more ap') : null,
  ]
    .filter(Boolean)
    .join(' · ');

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
