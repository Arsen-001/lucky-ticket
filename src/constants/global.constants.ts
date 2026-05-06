import { defaultLocale } from '@/i18n/config';

export const GlobalConstants = {
  projectName: 'Lucky Ticket',
  minPasswordLength: 8,
  coinName: 'LC',
  defaultLanguage: defaultLocale,
  referralPercentage: 5,
  telegramPremiumReferralPercentage: 10,
  primeReferralPercentage: 15,
  inviteActivityPoints: 10,
  inviteStars: 1,
  inviteTelegramPremiumActivityPoints: 20,
  inviteTelegramPremiumStars: 2,
  stakeDurationHours: 3,
  stakeCancelStarsPerLevel: 5,
  stakeDurationMinMonths: 1,
  stakeDurationMaxMonths: 12,
  stakeAprMinPercent: 1,
  stakeAprMaxPercent: 5,
  telegramBotUrl: 'https://t.me/lucky_ticket_bot',
  telegramSupportUrl: 'https://t.me/lucky_ticket_support',
  telegramChannelUrl: 'https://t.me/lucky_ticket_channel',

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

export const computeNextTierThreshold = (activityPoints: number): number | null => {
  const tier = computeActivityTier(activityPoints);
  const idx = activityTierOrder.indexOf(tier);
  if (idx === activityTierOrder.length - 1) return null;
  const nextTier = activityTierOrder[idx + 1];
  return GlobalConstants.apTierThresholds[nextTier];
};

export type CloverVariant =
  | 'leaf-1'
  | 'leaf-2'
  | 'leaf-3'
  | 'leaf-4'
  | 'leaf-5'
  | 'leaf-6'
  | 'leaf-7'
  | 'golden'
  | 'diamond'
  | 'rainbow-crown';

export interface CloverStatusGate {
  verifiedEmail?: boolean;
  tier?: ActivityTier;
  vipLevel?: number;
  prime?: boolean;
}

export interface CloverLevelDef {
  level: number;
  name: string;
  ticketsRequired: number;
  variant: CloverVariant;
  statusGate?: CloverStatusGate;
  description: string;
  unlock: string;
  rewardLs: number;
}

export const cloverLevels: CloverLevelDef[] = [
  {
    level: 1,
    name: 'Newbie',
    ticketsRequired: 10,
    variant: 'leaf-1',
    description: '1 leaf — basic luck, starting tasks, beginning of the path',
    unlock: 'Daily mini-tournaments',
    rewardLs: 50,
  },
  {
    level: 2,
    name: 'Amateur',
    ticketsRequired: 25,
    variant: 'leaf-2',
    description: '2 leaves — luck and hope, simple tournaments unlocked',
    unlock: 'Bronze tournaments',
    rewardLs: 100,
  },
  {
    level: 3,
    name: 'Expert',
    ticketsRequired: 50,
    variant: 'leaf-3',
    statusGate: { verifiedEmail: true },
    description: '3 leaves (trefoil) — luck, hope and love; the classic Irish symbol',
    unlock: 'Standard tasks unlocked',
    rewardLs: 200,
  },
  {
    level: 4,
    name: 'Lucky One',
    ticketsRequired: 100,
    variant: 'leaf-4',
    statusGate: { tier: 'bronze' },
    description: '4 leaves — luck, hope, love and wealth; the rare clover of happiness',
    unlock: 'Premium tournaments access',
    rewardLs: 350,
  },
  {
    level: 5,
    name: 'Master',
    ticketsRequired: 200,
    variant: 'leaf-5',
    statusGate: { tier: 'silver' },
    description: '5 leaves — financial success added; rare bonus to winnings',
    unlock: 'VIP tasks + win bonus',
    rewardLs: 500,
  },
  {
    level: 6,
    name: 'Guru',
    ticketsRequired: 400,
    variant: 'leaf-6',
    statusGate: { tier: 'gold' },
    description: '6 leaves — fame and recognition; an extremely rare find',
    unlock: 'Exclusive tournaments',
    rewardLs: 750,
  },
  {
    level: 7,
    name: 'Legend',
    ticketsRequired: 800,
    variant: 'leaf-7',
    statusGate: { tier: 'platinum' },
    description: '7 leaves — longevity of luck; max reward multipliers',
    unlock: 'Maximum reward multipliers',
    rewardLs: 1000,
  },
  {
    level: 8,
    name: 'Champion',
    ticketsRequired: 1500,
    variant: 'golden',
    statusGate: { tier: 'diamond', vipLevel: 1 },
    description: 'Golden clover — double luck; top-league tournaments',
    unlock: 'Top-league tournaments + reward x2',
    rewardLs: 1500,
  },
  {
    level: 9,
    name: 'Elite',
    ticketsRequired: 3000,
    variant: 'diamond',
    statusGate: { tier: 'diamond', vipLevel: 5, prime: true },
    description: 'Diamond clover — triple multiplier; closed events',
    unlock: 'Closed events + reward x3',
    rewardLs: 2500,
  },
  {
    level: 10,
    name: 'Lucky Emperor',
    ticketsRequired: 6000,
    variant: 'rainbow-crown',
    statusGate: { tier: 'diamond', vipLevel: 10, prime: true, verifiedEmail: true },
    description: 'Rainbow imperial 7-leaf clover — maximum status, all privileges open',
    unlock: 'All privileges + cosmetics',
    rewardLs: 5000,
  },
];

export interface CloverEvalProfile {
  ticketsEarned: number;
  isVerified: boolean;
  isPrime: boolean;
  vipLevel: number;
  activityPoints: number;
}

const isStatusGateMet = (
  gate: CloverStatusGate | undefined,
  profile: CloverEvalProfile
): boolean => {
  if (!gate) return true;
  if (gate.verifiedEmail && !profile.isVerified) return false;
  if (gate.prime && !profile.isPrime) return false;
  if (gate.vipLevel !== undefined && profile.vipLevel < gate.vipLevel) return false;
  if (gate.tier) {
    const userTier = computeActivityTier(profile.activityPoints);
    const userTierIndex = activityTierOrder.indexOf(userTier);
    const requiredTierIndex = activityTierOrder.indexOf(gate.tier);
    if (userTierIndex < requiredTierIndex) return false;
  }
  return true;
};

export const computeCloverLevel = (profile: CloverEvalProfile): number => {
  let level = 0;
  for (const def of cloverLevels) {
    if (profile.ticketsEarned < def.ticketsRequired) break;
    if (!isStatusGateMet(def.statusGate, profile)) break;
    level = def.level;
  }
  return level;
};

export const getCloverLevelDef = (level: number): CloverLevelDef | undefined =>
  cloverLevels.find(def => def.level === level);

export const getNextCloverLevelDef = (level: number): CloverLevelDef | undefined =>
  cloverLevels.find(def => def.level === level + 1);

export interface CloverBlocker {
  type: 'tickets' | 'verified' | 'tier' | 'vip' | 'prime';
  current?: number | string | boolean;
  required: number | string | boolean;
}

export const getCloverBlockers = (
  def: CloverLevelDef,
  profile: CloverEvalProfile
): CloverBlocker[] => {
  const blockers: CloverBlocker[] = [];
  if (profile.ticketsEarned < def.ticketsRequired) {
    blockers.push({
      type: 'tickets',
      current: profile.ticketsEarned,
      required: def.ticketsRequired,
    });
  }
  const gate = def.statusGate;
  if (gate?.verifiedEmail && !profile.isVerified) {
    blockers.push({ type: 'verified', current: false, required: true });
  }
  if (gate?.prime && !profile.isPrime) {
    blockers.push({ type: 'prime', current: false, required: true });
  }
  if (gate?.vipLevel !== undefined && profile.vipLevel < gate.vipLevel) {
    blockers.push({ type: 'vip', current: profile.vipLevel, required: gate.vipLevel });
  }
  if (gate?.tier) {
    const userTier = computeActivityTier(profile.activityPoints);
    const userTierIndex = activityTierOrder.indexOf(userTier);
    const requiredTierIndex = activityTierOrder.indexOf(gate.tier);
    if (userTierIndex < requiredTierIndex) {
      blockers.push({ type: 'tier', current: userTier, required: gate.tier });
    }
  }
  return blockers;
};

export const calcShowcaseSlotPrice = (slotIndex: number): number => {
  if (slotIndex < GlobalConstants.showcaseFreeSlots) return 0;
  const paidIndex = slotIndex - GlobalConstants.showcaseFreeSlots;
  return Math.round(
    GlobalConstants.showcaseFirstPaidSlotPriceLs *
      Math.pow(GlobalConstants.showcaseSlotPriceMultiplier, paidIndex)
  );
};
