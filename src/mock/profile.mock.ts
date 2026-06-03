import { images } from '@/constants/images';
import { faker } from '@faker-js/faker';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { achievements } from '@/mock/achievements.mock';
import { GlobalConstants } from '@/constants/global.constants';
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

const earnedCount = achievements.filter(a => a.earned).length;

export const ownProfile: ProfileResponse = {
  id: 'me',
  username: 'Arsen 001',
  avatar: images.avatar.src,
  banner: undefined,
  isVerified: true,
  isLuckyPlayer: true,
  isVIP: true,
  vipLevel: 2,
  activityPoints: 18_500,
  activityBest: {
    day: 32,
    dayRank: 24,
    week: 98,
    weekRank: 11,
    month: 240,
    monthRank: 9,
    allTime: 143,
    allTimeRank: 7,
  },
  ticketsEarned: 120,
  memberSince: '2024-09-12',
  streak: { days: 30, active: true },
  showcaseSlots: 3,
  showcaseMaxSlots: 3,
  pinnedAchievements: pinned,
  collageAchievements: collage,
  friendsPreview: friendsPreview.slice(0, 5),
  publicStats: {
    tournamentsPlayed: 12,
    tournamentsWon: 3,
    stakesCompleted: 8,
    ticketsSent: 17,
    friendsCount: friendsPreview.length,
    totalAchievements: achievements.length,
    earnedAchievements: earnedCount,
    likesReceived: 234,
  },
  privateStats: {
    lc: 537_000,
    ls: 12,
    ton: 0.42,
    ticketsByTier: {
      bronze: 154,
      silver: 41,
      gold: 8,
      platinum: 4,
      diamond: 2,
    },
  },
  recentAchievements: recent,
  isOwn: true,
  liked: false,
};

export const otherProfile: ProfileResponse = {
  ...ownProfile,
  id: 'user-2',
  username: 'NebulaPilot',
  isOwn: false,
  privateStats: undefined,
  liked: false,
  publicStats: {
    ...ownProfile.publicStats,
    likesReceived: 891,
    tournamentsWon: 17,
    stakesCompleted: 42,
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
  ownProfile.activityPoints += 1;
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
  ownProfile.activityPoints += 1;
  return { success: true };
};

export const profileMock = {
  profile: {
    me: ownProfile,
    'user-2': otherProfile,
  },
  'POST profile/like': likeProfileHandler,
  'POST profile/send-ticket': sendTicketHandler,
};
