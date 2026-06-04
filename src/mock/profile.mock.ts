import { images } from '@/constants/images';
import { faker } from '@faker-js/faker';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { achievements } from '@/mock/achievements.mock';
import { GlobalConstants } from '@/constants/global.constants';
import { mockDb } from '@/mock/backend/db';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const pinned = achievements
  .filter(a => a.isPinned)
  .sort((a, b) => (a.pinnedSlot ?? 0) - (b.pinnedSlot ?? 0));

const collage = achievements
  .filter(a => a.isCollagePinned)
  .sort((a, b) => (a.collageSlot ?? 0) - (b.collageSlot ?? 0));

const recent = achievements
  .filter(a => a.earned)
  .sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? ''))
  .slice(0, 5);

const friendsPreview = Array.from({ length: 12 }).map((_, i) => ({
  id: `friend-${i}`,
  username: faker.internet.username(),
  avatar: images.avatar.src,
}));

export const ownProfile: ProfileResponse = {
  id: 'me',
  username: 'Arsen 001',
  avatar: images.avatar.src,
  banner: undefined,
  // Account-level fields mirror the single source of truth (`mockDb.user`) so
  // the profile always matches the header / wallet / tier gates. Overlaid live
  // at serve time via `buildAccountOverlay()`.
  isVerified: mockDb.user.isVerified ?? false,
  isLuckyPlayer: mockDb.user.isLuckyPlayer,
  isVIP: mockDb.user.isVIP,
  vipLevel: mockDb.user.vipLevel,
  activityPoints: mockDb.user.activityPoints,
  activityBest: mockDb.accountStats.activityBest,
  ticketsEarned: mockDb.accountStats.ticketsEarned,
  memberSince: '2024-09-12',
  streak: mockDb.accountStats.streak,
  showcaseSlots: 3,
  showcaseMaxSlots: 3,
  pinnedAchievements: pinned,
  collageAchievements: collage,
  friendsPreview: friendsPreview.slice(0, mockDb.accountStats.friendsCount),
  publicStats: {
    tournamentsPlayed: mockDb.accountStats.tournamentsPlayed,
    tournamentsWon: mockDb.accountStats.tournamentsWon,
    stakesCompleted: mockDb.accountStats.stakesCompleted,
    ticketsSent: mockDb.accountStats.ticketsSent,
    friendsCount: mockDb.accountStats.friendsCount,
    totalAchievements: achievements.length,
    earnedAchievements: mockDb.accountStats.earnedAchievements,
    likesReceived: mockDb.accountStats.likesReceived,
  },
  privateStats: {
    lc: mockDb.user.coins,
    ls: mockDb.user.telegramStars,
    ton: mockDb.accountStats.ton,
    ticketsByTier: mockDb.accountStats.ticketsByTier,
  },
  recentAchievements: mockDb.accountStats.earnedAchievements > 0 ? recent : [],
  isOwn: true,
  liked: false,
  bannerIconPositions: {},
};

/**
 * Live account-level fields read from the single source of truth
 * (`mockDb.user`). Spread over the own-profile response at serve time so a
 * change to the account (AP, status, balances) shows up on the profile too —
 * no duplicated hardcoded values to keep in sync.
 */
export const buildAccountOverlay = (): Partial<ProfileResponse> => ({
  isVerified: mockDb.user.isVerified ?? false,
  isLuckyPlayer: mockDb.user.isLuckyPlayer,
  isVIP: mockDb.user.isVIP,
  vipLevel: mockDb.user.vipLevel,
  activityPoints: mockDb.user.activityPoints,
  privateStats: ownProfile.privateStats && {
    ...ownProfile.privateStats,
    lc: mockDb.user.coins,
    ls: mockDb.user.telegramStars,
  },
});

export const otherProfile: ProfileResponse = {
  ...ownProfile,
  id: 'user-2',
  username: 'NebulaPilot',
  isOwn: false,
  // A distinct, populated public player — independent of the signed-in
  // account's level (visiting a profile always shows real data).
  isVerified: true,
  isLuckyPlayer: false,
  isVIP: true,
  vipLevel: 5,
  activityPoints: 42_000,
  ticketsEarned: 480,
  streak: { days: 12, active: true },
  activityBest: {
    day: 28,
    dayRank: 31,
    week: 140,
    weekRank: 8,
    month: 360,
    monthRank: 5,
    allTime: 410,
    allTimeRank: 4,
  },
  friendsPreview: friendsPreview.slice(0, 5),
  recentAchievements: recent,
  privateStats: undefined,
  liked: false,
  // Distinct arrangement so visitors can see this is a public, per-user layout.
  bannerIconPositions: {
    'crown-tl': { left: 9, top: 52 },
    'star-tr': { left: 46, top: 7 },
    'gem-br': { left: 79, top: 48 },
  },
  publicStats: {
    tournamentsPlayed: 64,
    tournamentsWon: 17,
    stakesCompleted: 42,
    ticketsSent: 51,
    friendsCount: 30,
    totalAchievements: achievements.length,
    earnedAchievements: 38,
    likesReceived: 891,
  },
};

// One like per profile per 24h; liking grants the liker +1 AP (DOCS §5.3 / §17.3.4).
const likeProfileHandler = (args: FetchArgs) => {
  const { userId } = (args.body ?? {}) as { userId?: string };
  const target = userId === 'me' ? ownProfile : otherProfile;
  target.publicStats = {
    ...target.publicStats,
    likesReceived: target.publicStats.likesReceived + 1,
  };
  target.liked = true;
  target.canLikeAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  mockDb.user.activityPoints += 1;
  return {
    likesReceived: target.publicStats.likesReceived,
    liked: true,
    canLikeAt: target.canLikeAt,
  };
};

// Sending consumes the sender's tickets and grants +1 AP. Platinum/Diamond
// require Lucky Player; quantity is capped at the per-tier daily limit.
const sendTicketHandler = (args: FetchArgs) => {
  const { tier, quantity = 0 } = (args.body ?? {}) as { tier?: TicketType; quantity?: number };
  if (!tier) return { error: { status: 400, data: 'Tier is required' } };
  // VIP inherits the Lucky Player send-limit table (DOCS §7.3).
  const limits =
    GlobalConstants.ticketSendDailyLimits[
      ownProfile.isLuckyPlayer || ownProfile.isVIP ? 'luckyPlayer' : 'default'
    ];
  if (limits[tier] <= 0) {
    return { error: { status: 403, data: 'Lucky Player or VIP status required for this tier' } };
  }
  const sent = Math.min(Math.max(0, quantity), limits[tier]);
  const byTier = ownProfile.privateStats?.ticketsByTier;
  if (byTier) byTier[tier] = Math.max(0, (byTier[tier] ?? 0) - sent);
  mockDb.user.activityPoints += 1;
  return { success: true };
};

// Persist the owner's banner collage layout — last write wins.
const updateBannerIconsHandler = (args: FetchArgs) => {
  const { positions } = (args.body ?? {}) as {
    positions?: ProfileResponse['bannerIconPositions'];
  };
  ownProfile.bannerIconPositions = positions ?? {};
  // Return a copy, never the raw singleton: RTK Query stores the result in the
  // cache where Immer deep-freezes it in dev. Freezing `ownProfile` itself would
  // lock the shared mock object and make the next write throw (read-only prop).
  return { ...ownProfile };
};

export const profileMock = {
  profile: {
    me: ownProfile,
    'user-2': otherProfile,
  },
  'POST profile/like': likeProfileHandler,
  'POST profile/send-ticket': sendTicketHandler,
  'PATCH profile/banner-icons': updateBannerIconsHandler,
};
