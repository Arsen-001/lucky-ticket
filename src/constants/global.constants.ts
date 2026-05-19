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
  inviteActivityPoints: 10,
  inviteStars: 1,
  inviteTelegramPremiumActivityPoints: 20,
  inviteTelegramPremiumStars: 2,
  // Stake values are sourced from the single config (`appConfig.stakes`) —
  // change them there, not here.
  stakeDurationHours: appConfig.stakes.durationHours,
  stakeCancelStarsPerLevel: appConfig.stakes.cancelStarsPerLevel,
  stakeDurationMinMonths: appConfig.stakes.durationMinMonths,
  stakeDurationMaxMonths: appConfig.stakes.durationMaxMonths,
  stakeAprMinPercent: appConfig.stakes.aprMinPercent,
  stakeAprMaxPercent: appConfig.stakes.aprMaxPercent,
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
  apPerLevel: 500,
  starsPerTelegramStar: 1,
  tonBonusPercentage: 5,
  maxVipLevel: 10,
  apTierThresholds: {
    bronze: 0,
    silver: 1500,
    gold: 5000,
    platinum: 15000,
    diamond: 50000,
  },
  maxPlayerLevel: 100,
  playerLevelTierThresholds: {
    bronze: 1,
    silver: 11,
    gold: 36,
    platinum: 66,
    diamond: 100,
  },
  tournamentShardRewards: {
    first: 3,
    second: 2,
    third: 1,
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

export const computePlayerLevelTier = (level: number): ActivityTier => {
  const t = GlobalConstants.playerLevelTierThresholds;
  if (level >= t.diamond) return 'diamond';
  if (level >= t.platinum) return 'platinum';
  if (level >= t.gold) return 'gold';
  if (level >= t.silver) return 'silver';
  return 'bronze';
};

export const computeNextTierThreshold = (activityPoints: number): number | null => {
  const tier = computeActivityTier(activityPoints);
  const idx = activityTierOrder.indexOf(tier);
  if (idx === activityTierOrder.length - 1) return null;
  const nextTier = activityTierOrder[idx + 1];
  return GlobalConstants.apTierThresholds[nextTier];
};

export const calcShowcaseSlotPrice = (slotIndex: number): number => {
  if (slotIndex < GlobalConstants.showcaseFreeSlots) return 0;
  const paidIndex = slotIndex - GlobalConstants.showcaseFreeSlots;
  return Math.round(
    GlobalConstants.showcaseFirstPaidSlotPriceLs *
      Math.pow(GlobalConstants.showcaseSlotPriceMultiplier, paidIndex)
  );
};
