import { defaultLocale } from '@/i18n/config';
import { appConfig } from '@/config/app.config';

const apTiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const;

/**
 * Canonical AP-source rates — mirrors DOCS §5.3 "How Activity Points Are
 * Earned". Single source of truth for every "earn AP" surface in the UI.
 * `*ByTier` rates are keyed by ActivityTier (Bronze→Diamond). Invite rates
 * live in `inviteActivityPoints` / `inviteTelegramPremiumActivityPoints`.
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
  claimDailyLimit: 5,
  /** LS spent per 1 AP from purchases — no daily cap. */
  purchaseLsPerAp: 10,
  /** LC spent per 1 AP from spending — no daily cap. */
  spendLcPerAp: 2_500,
  dailyTaskByTier: { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 },
  weeklyTaskByTier: { bronze: 2, silver: 3, gold: 4, platinum: 5, diamond: 6 },
  claimByTier: { bronze: 1, silver: 2, gold: 4, platinum: 8, diamond: 16 },
  tournamentJoinByTier: { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 },
  /**
   * How many daily / weekly tasks a player of each tier can actually complete
   * (own-tier task ladder + the social share + the profile check-in). Used to
   * DERIVE the daily baseline below — change the counts or the rates and the
   * baseline, decay and tier pacing follow automatically.
   */
  dailyTasksCountByTier: { bronze: 3, silver: 4, gold: 5, platinum: 6, diamond: 7 },
  weeklyTasksCountByTier: { bronze: 3, silver: 4, gold: 5, platinum: 6, diamond: 7 },
};

/**
 * DERIVED — the no-donation daily AP ceiling per tier (DOCS §5.4): the sum of
 * every capped recurring source at that tier (streak + ads + ticket sends +
 * likes + claims + daily tasks + weekly tasks averaged per day). Never
 * hand-edit a baseline: tune the source rates/caps above instead, so the
 * number shown on the AP dashboard, the decay rate and the tier pacing can
 * never drift apart. Currently ≈38 / 49 / 67 / 97 / 150.
 */
const dailyBaselineApByTier = Object.fromEntries(
  apTiers.map(tier => [
    tier,
    Math.round(
      apRewards.dailyStreak +
        apRewards.watchVideo * apRewards.watchVideoDailyLimit +
        apRewards.sendTicket * apRewards.sendTicketDailyLimit +
        apRewards.likeProfile * apRewards.likeProfileDailyLimit +
        apRewards.claimDailyLimit * apRewards.claimByTier[tier] +
        apRewards.dailyTasksCountByTier[tier] * apRewards.dailyTaskByTier[tier] +
        (apRewards.weeklyTasksCountByTier[tier] * apRewards.weeklyTaskByTier[tier]) / 7
    ),
  ])
) as Record<(typeof apTiers)[number], number>;

export const GlobalConstants = {
  projectName: 'LuckyTicket365',
  minPasswordLength: 8,
  coinName: 'LC',
  defaultLanguage: defaultLocale,
  referralPercentage: 5,
  telegramPremiumReferralPercentage: 10,
  luckyPlayerReferralPercentage: 15,
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
  vipReferralPercentage: 25,
  /**
   * Hard floor for engine output rate: no matter how many speed boosts stack
   * (engine level + speed level + speed chip + speed booster), one ticket can
   * never be minted faster than this many seconds. 900s = 15 minutes.
   */
  engineMinSecondsPerTicket: 900,
  inviteActivityPoints: 10,
  inviteStars: 1,
  inviteTelegramPremiumActivityPoints: 20,
  inviteTelegramPremiumStars: 2,
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
  stakeFeeMinStars: appConfig.stakes.feeMinStars,
  stakeCancelFeeMinStars: appConfig.stakes.cancelFeeMinStars,
  stakeCancelFeeMultiplier: appConfig.stakes.cancelFeeMultiplier,
  stakeBronzeFreeStartCount: appConfig.stakes.bronzeFreeStartCount,
  telegramBotUrl: 'https://t.me/luckyticket365_bot',
  telegramSupportUrl: 'https://t.me/luckyticket365_support',
  telegramChannelUrl: 'https://t.me/luckyticket365_channel',

  starName: 'LS',
  tonName: 'TON',
  showcaseFreeSlots: 5,
  showcaseMaxSlots: 20,
  showcaseFirstPaidSlotPriceLs: 50,
  showcaseSlotPriceMultiplier: 1.4,
  collageMaxSlots: 3,
  likeIntervalHours: 24,
  starsPerTelegramStar: 1,
  tonBonusPercentage: 5,
  maxVipLevel: 20,
  /** Derived from `apRewards` above — see the computation for the rationale. */
  dailyBaselineApByTier,
  /** Days of inactivity before AP decay begins. */
  decayGraceDays: 7,
  /**
   * Product pacing targets (days per leg at the DERIVED daily baselines
   * ≈38/49/67/97): Silver in ~15 days, Gold +1 month, Platinum +3 months,
   * Diamond +6 months → actual legs ≈14.5 / 29.6 / 89.6 / 180.4 days
   * (~10.5 months to Diamond total). Asserted in `tests/economy-sim.test.ts`.
   */
  apTierThresholds: {
    bronze: 0,
    silver: 550,
    gold: 2000,
    platinum: 8000,
    diamond: 25500,
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
  /**
   * Hidden platform-wide gate for tournament tiers: a tier only becomes
   * playable once the number of active players crosses its threshold.
   * Counts active players only, not total registrations. Never shown in UI.
   */
  tournamentTierActivePlayerThresholds: {
    bronze: 0,
    silver: 10_000,
    gold: 50_000,
    platinum: 200_000,
    diamond: 1_000_000,
  },
};

export type ActivityTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export const activityTierOrder: ActivityTier[] = [
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
];

export const computeActivityTier = (activityPoints: number): ActivityTier => {
  const t = GlobalConstants.apTierThresholds;
  if (activityPoints >= t.diamond) return 'diamond';
  if (activityPoints >= t.platinum) return 'platinum';
  if (activityPoints >= t.gold) return 'gold';
  if (activityPoints >= t.silver) return 'silver';
  return 'bronze';
};

/** Approximate daily AP for the player's current tier without donation — decay base (DOCS §5.4). */
export const computeDailyBaselineAp = (activityPoints: number): number =>
  GlobalConstants.dailyBaselineApByTier[computeActivityTier(activityPoints)];

export const computeNextTierThreshold = (activityPoints: number): number | null => {
  const tier = computeActivityTier(activityPoints);
  const idx = activityTierOrder.indexOf(tier);
  if (idx === activityTierOrder.length - 1) return null;
  const nextTier = activityTierOrder[idx + 1];
  return GlobalConstants.apTierThresholds[nextTier];
};

/**
 * Whether a tournament tier is platform-activated — the hidden active-player
 * gate from DOCS §11.2.2. A tier becomes playable only once the platform's
 * active-player count crosses its threshold; the gate is one-directional.
 */
export const isTournamentTierActivated = (tier: ActivityTier, activePlayers: number): boolean =>
  activePlayers >= GlobalConstants.tournamentTierActivePlayerThresholds[tier];

export const calcShowcaseSlotPrice = (slotIndex: number): number => {
  if (slotIndex < GlobalConstants.showcaseFreeSlots) return 0;
  const paidIndex = slotIndex - GlobalConstants.showcaseFreeSlots;
  return Math.round(
    GlobalConstants.showcaseFirstPaidSlotPriceLs *
      Math.pow(GlobalConstants.showcaseSlotPriceMultiplier, paidIndex)
  );
};
