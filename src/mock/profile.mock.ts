import { images } from '@/constants/images';
import { faker } from '@faker-js/faker';
import { achievements } from '@/mock/achievements.mock';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';

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
  publicId: '11111',
  username: 'Arsen 001',
  avatar: images.avatar.src,
  banner: undefined,
  isVerified: true,
  isPrime: true,
  isVIP: true,
  vipLevel: 2,
  activityPoints: 750,
  activityBest: {
    day: 32,
    dayRank: 24,
    week: 98,
    weekRank: 11,
    allTime: 143,
    allTimeRank: 7,
  },
  apToNextLevel: 250,
  apForCurrentLevel: 500,
  ticketsEarned: 120,
  memberSince: '2024-09-12',
  streak: { days: 30, active: true },
  showcaseSlots: 5,
  showcaseMaxSlots: 20,
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
    lc: 537,
    ls: 12,
    ton: 0.42,
    ticketsByTier: {
      bronze: 154,
      silver: 41,
      gold: 8,
    },
  },
  recentAchievements: recent,
  isOwn: true,
  liked: false,
};

export const otherProfile: ProfileResponse = {
  ...ownProfile,
  id: 'user-2',
  publicId: '20347',
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

export const profileMock = {
  profile: {
    me: ownProfile,
    'user-2': otherProfile,
  },
};
