import { defaultLocale } from '@/i18n/config';
import { appConfig } from '@/config/app.config';

const apTiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const;

/**
 * Canonical AP-source rates — mirrors DOCS §5.3 "How Activity Points Are
 * Earned". Single source of truth for every "earn AP" surface in the UI.
 * `*ByTier` rates are keyed by ActivityTier (Bronze→Diamond). The invite rate
 * lives in `inviteActivityPoints`.
 */
const apRewards = {
  dailyStreak: 3,
  verifyEmail: 20,
  watchVideo: 2,
  /** Default daily ads cap. Lucky Player gets the boosted limit below. */
  watchVideoDailyLimit: 10,
  /** Daily ads cap for Lucky Player holders (DOCS §7.3). */
  luckyPlayerWatchVideoDailyLimit: 20,
  sendTicket: 1,
  sendTicketDailyLimit: 3,
  likeProfile: 1,
  likeProfileDailyLimit: 3,
  // NO rate for spending: buying pays no AP, in either currency. `purchaseLsPerAp: 10`
  // and `spendLcPerAp: 2500` used to live here on the strength of DOCS §5.3 alone —
  // the backend never granted a single point for a purchase, and the market modal
  // was promising AP that never arrived. Product call 10.08.2026: tiers are earned
  // by playing, not by paying, so the promise came out instead of being built.
  dailyTaskByTier: { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 },
  weeklyTaskByTier: { bronze: 2, silver: 3, gold: 4, platinum: 5, diamond: 6 },
  tournamentJoinByTier: { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 },
  /**
   * Recurring tasks that carry NO tier — the engine claim, the 3-ad task, the
   * channel check-in and the all-set bonus daily; the 7-day check-in and the
   * all-set bonus weekly. The rate follows the TASK's tier, and theirs is null,
   * so they pay the Bronze rate to every player. The tier ladder on top is one
   * task per rung up to the player's own tier.
   */
  flatDailyTasks: 4,
  flatWeeklyTasks: 2,
  /**
   * How many recurring tasks a player of each tier can complete — the flat ones
   * plus their tier ladder. For counting ("is the set done?"), never for
   * pricing AP: the tasks in it pay different rates.
   */
  dailyTasksCountByTier: { bronze: 5, silver: 6, gold: 7, platinum: 8, diamond: 9 },
  weeklyTasksCountByTier: { bronze: 3, silver: 4, gold: 5, platinum: 6, diamond: 7 },
};

/** Tiers a player of `tier` has unlocked, Bronze → their own. */
const tiersUpTo = (tier: (typeof apTiers)[number]) => apTiers.slice(0, apTiers.indexOf(tier) + 1);

/**
 * DERIVED — AP per day / per week from recurring tasks, summed the way the
 * catalog actually pays: each unlocked tier task at ITS OWN rate, plus the
 * tier-less tasks at the Bronze rate.
 *
 * This replaced `tasksCountByTier × dailyTaskByTier[playerTier]`, which
 * credited a Diamond player 5 AP for the channel check-in and 5 for the Bronze
 * tournament task — 35 AP/day of tasks against the 19 the catalog pays.
 */
const dailyTaskApByTier = Object.fromEntries(
  apTiers.map(tier => [
    tier,
    tiersUpTo(tier).reduce((ap, rung) => ap + apRewards.dailyTaskByTier[rung], 0) +
      apRewards.flatDailyTasks * apRewards.dailyTaskByTier.bronze,
  ])
) as Record<(typeof apTiers)[number], number>;

const weeklyTaskApByTier = Object.fromEntries(
  apTiers.map(tier => [
    tier,
    tiersUpTo(tier).reduce((ap, rung) => ap + apRewards.weeklyTaskByTier[rung], 0) +
      apRewards.flatWeeklyTasks * apRewards.weeklyTaskByTier.bronze,
  ])
) as Record<(typeof apTiers)[number], number>;

/**
 * DERIVED — the no-donation daily AP ceiling per tier (DOCS §5.4): the sum of
 * every capped recurring source at that tier (streak + ads + ticket sends +
 * likes + daily tasks + weekly tasks averaged per day). Engine claims award
 * no AP (product decision — claims pay in tickets only). Never hand-edit a
 * baseline: tune the source rates/caps above instead, so the number shown on
 * the AP dashboard, the decay rate and the tier pacing can never drift apart.
 * Currently ≈35 / 37 / 41 / 46 / 51 — it read 33/39/47/57/70 while the task
 * term priced every task at the PLAYER's tier rate instead of the task's own.
 */
const dailyBaselineApByTier = Object.fromEntries(
  apTiers.map(tier => [
    tier,
    Math.round(
      apRewards.dailyStreak +
        apRewards.watchVideo * apRewards.watchVideoDailyLimit +
        apRewards.sendTicket * apRewards.sendTicketDailyLimit +
        apRewards.likeProfile * apRewards.likeProfileDailyLimit +
        dailyTaskApByTier[tier] +
        weeklyTaskApByTier[tier] / 7
    ),
  ])
) as Record<(typeof apTiers)[number], number>;

export const GlobalConstants = {
  projectName: 'LuckyTicket365',
  minPasswordLength: 8,
  /** Username limits mirror the backend's shared rule (src/common/username.rules.ts):
   *  3–32 chars, max matching Telegram's own handle limit. */
  usernameMinLength: 3,
  usernameMaxLength: 32,
  usernamePattern: /^[A-Za-z0-9._-]+$/,
  coinName: 'LC',
  defaultLanguage: defaultLocale,
  /**
   * The referral reward (DOCS §17.2): this % of the LC a referred friend wins
   * in a TOURNAMENT accrues to whoever invited them, minted on top so the
   * friend's own prize is untouched.
   *
   * Flat — the friend's status does not change it. Display fallback only; the
   * live value rides on `GET /config` (`referral.tournamentLcPct`) so an admin
   * retune reaches the screen without a deploy. @see useReferralReward
   */
  referralTournamentLcPercentage: 4,
  /**
   * The SECOND level: this % of a friend-of-a-friend's tournament prize goes to
   * whoever invited the middle link.
   *
   * Carved out of the number above rather than added to it — the pair is the
   * flat 5% that used to be one level. Display fallback only; the live value
   * rides on `GET /config` (`referral.tournamentLcL2Pct`).
   */
  referralTournamentLcL2Percentage: 1,
  /** Engine cycle speed reduction granted by Lucky Player status (stacks with chips/boosters). */
  luckyPlayerEngineSpeedBoostPct: 10,
  /** Flat discount applied to every Market item price for Lucky Player holders (DOCS §7.3). */
  luckyPlayerMarketDiscountPct: 10,
  /** Multiplier (in %) added to stake LC yield for Lucky Player holders — stacks on top of APR. */
  luckyPlayerStakeYieldBoostPct: 20,
  /** Bonus (in %) applied to LC rewards from tournament placements for Lucky Player holders. */
  luckyPlayerTournamentRewardBoostPct: 25,
  /** Bonus (in %) applied to AP earned when joining a tournament for Lucky Player holders. */
  luckyPlayerTournamentJoinApBoostPct: 50,
  /**
   * VIP perk magnitudes (DOCS §7.3 — high-tier permanent status). Per design,
   * VIP values exceed Lucky Player at every category and supersede them when
   * both are active — the higher-tier value wins, the two never stack (DOCS
   * §7.3). Tied to `maxVipLevel = 20` (no per-level scaling here — the listed
   * value is what a VIP holder gets regardless of their level).
   */
  vipEngineSpeedBoostPct: 25,
  vipStakeYieldBoostPct: 40,
  vipMarketDiscountPct: 20,
  vipTournamentRewardBoostPct: 50,
  vipTournamentJoinApBoostPct: 100,
  vipWatchVideoDailyLimit: 40,
  /**
   * Pause between rewarded ads: the next slot stays locked for this long after
   * a view, counting down on its own button. Two reasons, one of them the
   * network's: Adsgram answers a too-quick second request with `onNonStopShow`
   * (our `tooFast`), which reads to the player as "broken" rather than "wait".
   * The gap is also when the SDK is warmed for the next one.
   */
  adCooldownSeconds: 5,
  /**
   * Hard floor for engine output rate: no matter how many speed boosts stack
   * (engine level + speed level + speed chip + speed booster), one ticket can
   * never be minted faster than this many seconds. 900s = 15 minutes.
   */
  engineMinSecondsPerTicket: 900,
  /**
   * How many ticket sprites a claim flies to the Tickets tab: one per ticket
   * collected, and never more than this. A capacity-1 engine flies one, a
   * capacity-10 engine flies ten, and anything above ten still flies ten —
   * past that the burst stops reading as "count" and starts covering the
   * screen. @see ticketFlightCount
   */
  maxFlyingTickets: 10,
  /**
   * What one invited friend pays the inviter, once, at registration. FLAT —
   * a Telegram Premium invitee used to pay double, which priced a friend by
   * something the inviter cannot influence. Display fallback only; the live
   * value rides on `GET /config`. @see useInviteRewards
   */
  inviteActivityPoints: 10,
  inviteStars: 1,
  // Stake values are sourced from the single config (`appConfig.stakes`) —
  // change them there, not here.
  stakeDurationMinMonths: appConfig.stakes.durationMinMonths,
  stakeDurationMaxMonths: appConfig.stakes.durationMaxMonths,
  stakeAprMinPercent: appConfig.stakes.aprMinPercent,
  stakeAprMaxPercent: appConfig.stakes.aprMaxPercent,
  stakeApDivisor: appConfig.stakes.apDivisor,
  stakeApCompletionBonusPercent: appConfig.stakes.apCompletionBonusPercent,
  stakeFeeStep: appConfig.stakes.feeStep,
  stakeFeeMonthDiscountPercent: appConfig.stakes.feeMonthDiscountPercent,
  stakeFeeVolumeDiscount: appConfig.stakes.feeVolumeDiscount,
  stakeFeeDiscountBonusLuckyPlayer: appConfig.stakes.feeDiscountBonusLuckyPlayer,
  stakeFeeMinStars: appConfig.stakes.feeMinStars,
  stakeCancelFeeMinStars: appConfig.stakes.cancelFeeMinStars,
  stakeCancelFeeMultiplier: appConfig.stakes.cancelFeeMultiplier,
  stakeFreeStartCount: appConfig.stakes.freeStartCount,
  /** Max units of a countable Market item (tickets) purchasable in one order. */
  marketMaxPurchaseQuantity: 999,
  /**
   * Shards are bought one request per unit (the backend buy DTO has no count
   * field), so the per-order cap keeps the client-side request loop short.
   */
  marketMaxShardPurchaseQuantity: 10,
  telegramBotUrl: 'https://t.me/luckyticket365_bot',
  telegramSupportUrl: 'https://t.me/luckyticket365_support',
  telegramChannelUrl: 'https://t.me/luckyticket365',

  starName: 'LS',
  tonName: 'TON',
  // Showcase is fixed at 3 slots — paid expansion is disabled (max == free).
  // The buy-slot flow (API/mocks/UI) stays dormant and reactivates by raising
  // `showcaseMaxSlots`; the price curve below only applies to paid slots.
  showcaseFreeSlots: 3,
  showcaseMaxSlots: 3,
  showcaseFirstPaidSlotPriceLs: 50,
  showcaseSlotPriceMultiplier: 1.4,
  collageMaxSlots: 3,
  likeIntervalHours: 24,
  starsPerTelegramStar: 1,
  tonBonusPercentage: 5,
  maxVipLevel: 20,
  /** Derived from `apRewards` above — see the computation for the rationale. */
  dailyBaselineApByTier,
  /** AP a tier earns per day / per week from recurring tasks — see above. */
  dailyTaskApByTier,
  weeklyTaskApByTier,
  /** Days of inactivity before AP decay begins. */
  decayGraceDays: 7,
  /**
   * Product pacing targets (days per leg at the DERIVED daily baselines
   * ≈33/39/47/57): Silver in ~15 days, Gold +1 month, Platinum +3 months,
   * Diamond +6 months → actual legs ≈15.2 / 29.5 / 90.4 / 177.2 days
   * (~10.3 months to Diamond total). Asserted in `tests/economy-sim.test.ts`.
   * Retuned when engine-claim AP was removed (baselines dropped) so the
   * pacing targets held.
   */
  apTierThresholds: {
    bronze: 0,
    silver: 500,
    gold: 1650,
    platinum: 5900,
    diamond: 16000,
  },
  /**
   * Second half of the tier gate (DOCS §5.1): a tier unlocks only when the
   * player has BOTH the AP threshold above AND this many invited friends
   * (cumulative activated referrals, `MeResponse.referralsCount`). Must stay
   * monotonically non-decreasing Bronze→Diamond. Mirrors the backend
   * `TIER_REFERRAL_REQUIREMENTS`.
   */
  tierReferralRequirements: {
    bronze: 0,
    silver: 2,
    gold: 5,
    platinum: 10,
    diamond: 20,
  },
  apRewards,
  /**
   * Max tickets sendable to one recipient per day, by tier (DOCS §17.3.3).
   * Platinum and Diamond require Lucky Player status — `default` caps them at 0.
   */
  ticketSendDailyLimits: {
    default: { bronze: 1, silver: 1, gold: 1, platinum: 0, diamond: 0 },
    luckyPlayer: { bronze: 5, silver: 4, gold: 3, platinum: 2, diamond: 1 },
  },
  tournamentShardRewards: {
    first: 3,
    second: 2,
    third: 1,
  },
  // NO tournament-tier active-player gate. `tournamentTierActivePlayerThresholds`
  // (0 / 10k / 50k / 200k / 1M) and `isTournamentTierActivated` used to live here
  // and were enforced in exactly one place: the dev mock — where the seeded
  // player count sat above the top threshold, so even there the gate never once
  // fired. The real backend has no such check and never had one, so on production
  // the rule was pure fiction. Removed 10.08.2026 rather than implemented: what
  // actually limits the tiers today is the spawner, which only ever creates
  // BRONZE tournaments (DOCS §11.2.2).
};

export type ActivityTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export const activityTierOrder: ActivityTier[] = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
];

/**
 * Highest tier the player qualifies for (DOCS §5.1): needs BOTH the AP
 * threshold AND the referral requirement (invited-friends count from
 * `MeResponse.referralsCount` / `ProfileResponse.referralsCount`).
 */
export const computeActivityTier = (
  activityPoints: number,
  referralsCount: number
): ActivityTier => {
  const t = GlobalConstants.apTierThresholds;
  const r = GlobalConstants.tierReferralRequirements;
  let tier: ActivityTier = 'bronze';
  for (const candidate of activityTierOrder) {
    if (activityPoints >= t[candidate] && referralsCount >= r[candidate]) tier = candidate;
  }
  return tier;
};

/** Approximate daily AP for the player's current tier without donation — decay base (DOCS §5.4). */
export const computeDailyBaselineAp = (activityPoints: number, referralsCount: number): number =>
  GlobalConstants.dailyBaselineApByTier[computeActivityTier(activityPoints, referralsCount)];

export const computeNextTierThreshold = (
  activityPoints: number,
  referralsCount: number
): number | null => {
  const tier = computeActivityTier(activityPoints, referralsCount);
  const idx = activityTierOrder.indexOf(tier);
  if (idx === activityTierOrder.length - 1) return null;
  const nextTier = activityTierOrder[idx + 1];
  return GlobalConstants.apTierThresholds[nextTier];
};

/**
 * How many MORE friends the player must invite to satisfy the next tier's
 * referral requirement (0 = the referral half of the gate is already met).
 */
export const computeNextTierReferralGap = (
  activityPoints: number,
  referralsCount: number
): number => {
  const tier = computeActivityTier(activityPoints, referralsCount);
  const idx = activityTierOrder.indexOf(tier);
  if (idx === activityTierOrder.length - 1) return 0;
  const nextTier = activityTierOrder[idx + 1];
  return Math.max(0, GlobalConstants.tierReferralRequirements[nextTier] - referralsCount);
};

export const calcShowcaseSlotPrice = (slotIndex: number): number => {
  if (slotIndex < GlobalConstants.showcaseFreeSlots) return 0;
  const paidIndex = slotIndex - GlobalConstants.showcaseFreeSlots;
  return Math.round(
    GlobalConstants.showcaseFirstPaidSlotPriceLs *
      Math.pow(GlobalConstants.showcaseSlotPriceMultiplier, paidIndex)
  );
};
