import { defaultLocale } from '@/i18n/config';
import { appConfig } from '@/config/app.config';

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
  /** Approximate daily AP a player earns at each tier without donation — decay base (DOCS §5.4). */
  dailyBaselineApByTier: {
    bronze: 70,
    silver: 90,
    gold: 111,
    platinum: 131,
    diamond: 152,
  },
  /** Days of inactivity before AP decay begins. */
  decayGraceDays: 7,
  apTierThresholds: {
    bronze: 0,
    silver: 2000,
    gold: 10000,
    platinum: 30000,
    diamond: 54000,
  },
  /**
   * Canonical AP-source rates — mirrors DOCS §5.3 "How Activity Points Are
   * Earned". Single source of truth for every "earn AP" surface in the UI.
   * `*ByTier` rates are keyed by ActivityTier (Bronze→Diamond). Invite rates
   * live in `inviteActivityPoints` / `inviteTelegramPremiumActivityPoints`.
   */
  apRewards: {
    dailyStreak: 3,
    verifyEmail: 20,
    watchVideo: 2,
    watchVideoDailyLimit: 20,
    sendTicket: 1,
    sendTicketDailyLimit: 3,
    likeProfile: 1,
    likeProfileDailyLimit: 3,
    claimDailyLimit: 5,
    /** LS spent per 1 AP from purchases — no daily cap. */
    purchaseLsPerAp: 10,
    /** LC spent per 1 AP from spending — no daily cap. */
    spendLcPerAp: 25_000,
    dailyTaskByTier: { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 },
    weeklyTaskByTier: { bronze: 2, silver: 3, gold: 4, platinum: 5, diamond: 6 },
    claimByTier: { bronze: 1, silver: 2, gold: 4, platinum: 8, diamond: 16 },
    tournamentJoinByTier: { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 },
  },
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
