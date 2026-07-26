import { images } from '@/constants/images';
import type { UserAvatar } from '@/types/interfaces/avatars.interfaces';

const avatars: UserAvatar[] = [
  {
    id: 'avatar-1',
    src: images.avatar1.src,
    name: 'Pixel Rookie',
    tier: 'free',
    level: 1,
    owned: true,
  },
  {
    id: 'avatar-2',
    src: images.avatar2.src,
    name: 'Pixel Scout',
    tier: 'free',
    level: 2,
    owned: true,
  },
  {
    id: 'avatar-3',
    src: images.avatar3.src,
    name: 'Sparkrunner',
    tier: 'paid',
    level: 3,
    boost: { type: 'engineSpeed', pct: 3 },
    owned: false,
  },
  {
    id: 'avatar-4',
    src: images.avatar4.src,
    name: 'Coin Hunter',
    tier: 'paid',
    level: 4,
    boost: { type: 'marketDiscount', pct: 5 },
    owned: false,
  },
  {
    id: 'avatar-5',
    src: images.avatar5.src,
    name: 'AP Drifter',
    tier: 'paid',
    level: 5,
    boost: { type: 'apEarn', pct: 7 },
    owned: false,
  },
  {
    id: 'avatar-6',
    src: images.avatar6.src,
    name: 'Champion',
    tier: 'paid',
    level: 6,
    boost: { type: 'tournamentReward', pct: 10 },
    dailyReward: { kind: 'lc', amount: 50_000 },
    owned: false,
  },
  {
    id: 'avatar-7',
    src: images.avatarYerevan.src,
    name: 'Multiplier Adept',
    tier: 'paid',
    level: 7,
    boost: { type: 'claimMultiplier', pct: 12 },
    dailyReward: { kind: 'lc', amount: 120_000 },
    owned: false,
  },
  {
    id: 'avatar-8',
    src: images.avatar1.src,
    name: 'Speedstar',
    tier: 'paid',
    level: 8,
    boost: { type: 'engineSpeed', pct: 15 },
    dailyReward: { kind: 'stars', amount: 5 },
    owned: false,
  },
  {
    id: 'avatar-9',
    src: images.avatar2.src,
    name: 'Bargain Lord',
    tier: 'paid',
    level: 9,
    boost: { type: 'marketDiscount', pct: 18 },
    dailyReward: { kind: 'stars', amount: 12 },
    owned: false,
  },
  {
    id: 'avatar-10',
    src: images.avatar.src,
    name: 'Cyber Emperor',
    tier: 'paid',
    level: 10,
    boost: { type: 'claimMultiplier', pct: 25 },
    dailyReward: { kind: 'ticket', amount: 1, tier: 'gold' },
    owned: true,
  },
];

/**
 * Daily-reward accrual, stateful so the claim flow can actually be exercised in
 * dev: claiming empties the pile and the card disappears, exactly as in prod.
 *
 * Amounts mirror the BACKEND catalog (`avatars.catalog.ts` — Champion 100 LC/day)
 * rather than the inflated figures in the mock avatar list above, so what the
 * card renders here matches what a real player sees.
 */
const dailyRewardState = {
  avatarId: 'champion',
  avatarName: 'Champion',
  ratePerDay: { kind: 'lc' as const, amount: 100 },
  pendingLc: 400,
  pendingStars: 0,
  daysAccrued: 4,
  canClaim: true,
  lastClaimedAt: null as string | null,
};

export const avatarsMock = {
  avatars,
  'GET avatars/daily-reward': () => ({ ...dailyRewardState }),
  'POST avatars/daily-reward/claim': () => {
    const granted = {
      grantedLc: dailyRewardState.pendingLc,
      grantedStars: dailyRewardState.pendingStars,
      days: dailyRewardState.daysAccrued,
    };
    dailyRewardState.pendingLc = 0;
    dailyRewardState.pendingStars = 0;
    dailyRewardState.daysAccrued = 0;
    dailyRewardState.canClaim = false;
    dailyRewardState.lastClaimedAt = new Date().toISOString();
    return granted;
  },
};
