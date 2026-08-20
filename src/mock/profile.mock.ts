import { images } from '@/constants/images';
import { faker } from '@faker-js/faker';
import type { FetchArgs } from '@reduxjs/toolkit/query';
import { achievements } from '@/mock/achievements.mock';
import { GlobalConstants, calcShowcaseSlotPrice } from '@/constants/global.constants';
import { mockDb } from '@/mock/backend/db';
import type { PlayerStats, ProfileResponse } from '@/types/interfaces/profile.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import type {
  Achievement,
  BuySlotResponse,
  PinAchievementRequest,
  UnpinAchievementRequest,
} from '@/types/interfaces/achievement.interfaces';

const pinned = achievements
  .filter(a => a.isPinned)
  .sort((a, b) => (a.pinnedSlot ?? 0) - (b.pinnedSlot ?? 0));

// Collage pins live in-memory (the showcase uses `pinState` because the full
// badge grid reads the same pins; the collage has no other consumer).
const collagePins = new Map<number, string>(
  achievements
    .filter(a => a.isCollagePinned && a.collageSlot != null)
    .map(a => [a.collageSlot as number, a.id])
);

const getCollageAchievements = (): Achievement[] =>
  [...collagePins.entries()]
    .sort(([slotA], [slotB]) => slotA - slotB)
    .flatMap(([slot, id]) => {
      const ach = achievements.find(a => a.id === id);
      return ach ? [{ ...ach, isCollagePinned: true, collageSlot: slot }] : [];
    });

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
  // A real id (not 'me'): the id is user-facing — share links build
  // `/profile/<id>` from it and the support block displays it.
  id: 'user-1',
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
  referralsCount: mockDb.user.referralsCount,
  activityBest: mockDb.accountStats.activityBest,
  ticketsEarned: mockDb.accountStats.ticketsEarned,
  memberSince: '2024-09-12',
  streak: mockDb.accountStats.streak,
  showcaseSlots: GlobalConstants.showcaseFreeSlots,
  showcaseMaxSlots: GlobalConstants.showcaseMaxSlots,
  pinnedAchievements: pinned,
  collageAchievements: getCollageAchievements(),
  friendsPreview: friendsPreview.slice(0, mockDb.accountStats.friendsCount),
  publicStats: {
    duelMatches: 14,
    duelWins: 8,
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
  username: mockDb.user.username,
  displayName: mockDb.user.displayName,
  isVerified: mockDb.user.isVerified ?? false,
  isLuckyPlayer: mockDb.user.isLuckyPlayer,
  isVIP: mockDb.user.isVIP,
  vipLevel: mockDb.user.vipLevel,
  activityPoints: mockDb.user.activityPoints,
  referralsCount: mockDb.user.referralsCount,
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
  // Emoji + a name longer than the row it sits in — the two shapes a Telegram
  // name takes that an ASCII handle never could.
  displayName: '🚀 Небула Пилот',
  isOwn: false,
  // Invited by the signed-in account, so the tournament invite is offered on
  // this profile (DOCS §17.3.3). `strangerProfile` below is the other half.
  isMyReferral: true,
  // A distinct, populated public player — independent of the signed-in
  // account's level (visiting a profile always shows real data).
  isVerified: true,
  isLuckyPlayer: false,
  isVIP: true,
  vipLevel: 5,
  activityPoints: 42_000,
  referralsCount: 26,
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
    duelMatches: 14,
    duelWins: 8,
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

/**
 * A player this account never invited — reached from the leaderboard or a
 * shared link. Everything social works on them except the tournament invite,
 * which is referrals-only (DOCS §17.3.3): the button must be absent here, and
 * `POST profile/invite-tournament` must refuse them even if it is called.
 */
export const strangerProfile: ProfileResponse = {
  ...otherProfile,
  id: 'user-3',
  username: 'QuasarNomad',
  displayName: 'Quasar Nomad',
  isMyReferral: false,
};

/** Profiles reachable by id, so the invite handler can check the same rule. */
const otherProfilesById: Record<string, ProfileResponse> = {
  [otherProfile.id]: otherProfile,
  [strangerProfile.id]: strangerProfile,
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
  target.canLikeAt = new Date(
    Date.now() + GlobalConstants.likeIntervalHours * 60 * 60 * 1000
  ).toISOString();
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

// Slot expansions are one-time purchases paid in Lucky Stars, priced by the
// progressive curve in `calcShowcaseSlotPrice` (DOCS §17.4.8).
const buyShowcaseSlotHandler = (args: FetchArgs) => {
  const { targetSlot } = (args.body ?? {}) as { targetSlot?: number };
  if (ownProfile.showcaseSlots >= GlobalConstants.showcaseMaxSlots) {
    return { error: { status: 400, data: 'All showcase slots already unlocked' } };
  }
  const slot = targetSlot ?? ownProfile.showcaseSlots;
  const costLs = calcShowcaseSlotPrice(slot);
  if (mockDb.user.telegramStars < costLs) {
    return { error: { status: 402, data: 'Not enough Lucky Stars' } };
  }
  mockDb.user.telegramStars -= costLs;
  ownProfile.showcaseSlots += 1;
  const response: BuySlotResponse = {
    slot,
    costLs,
    newTotalSlots: ownProfile.showcaseSlots,
    remainingLs: mockDb.user.telegramStars,
  };
  return response;
};

const collagePinHandler = (args: FetchArgs) => {
  const { achievementId, slot } = (args.body ?? {}) as Partial<PinAchievementRequest>;
  if (!achievementId || slot == null || slot < 0 || slot >= GlobalConstants.collageMaxSlots) {
    return { error: { status: 400, data: 'Invalid collage slot' } };
  }
  // One badge can occupy only one slot — re-pinning moves it.
  for (const [s, id] of collagePins) {
    if (id === achievementId) collagePins.delete(s);
  }
  collagePins.set(slot, achievementId);
  ownProfile.collageAchievements = getCollageAchievements();
  return { ...ownProfile, ...buildAccountOverlay() };
};

const collageUnpinHandler = (args: FetchArgs) => {
  const { slot } = (args.body ?? {}) as Partial<UnpinAchievementRequest>;
  if (slot == null) return { error: { status: 400, data: 'Slot is required' } };
  collagePins.delete(slot);
  ownProfile.collageAchievements = getCollageAchievements();
  return { ...ownProfile, ...buildAccountOverlay() };
};

// Nothing cached changes for the sender — the invitation lands on the other
// user's side. Only one's own referrals can be invited (DOCS §17.3.3); the
// button is hidden elsewhere, and this mirrors the backend's 403 for the case
// where the request is made anyway.
const inviteToTournamentHandler = (args: FetchArgs) => {
  const { userId, tournamentId } = (args.body ?? {}) as {
    userId?: string;
    tournamentId?: string;
  };
  if (!tournamentId) return { error: { status: 400, data: 'Tournament is required' } };
  if (!userId || !otherProfilesById[userId]?.isMyReferral) {
    return { error: { status: 403, data: 'not-your-referral' } };
  }
  return { success: true, invitationId: `inv-${Date.now()}` };
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

/**
 * Lifetime stats for the own-profile screen. Written to look like a real
 * mid-game account rather than round numbers: an unfinished-tournament player
 * would carry nulls, and the screen must be developed against both shapes.
 */
const playerStats: PlayerStats = {
  since: new Date(Date.now() - 63 * 24 * 60 * 60 * 1000).toISOString(),
  activity: {
    daysActive: 41,
    currentStreak: 6,
    longestStreak: 14,
    activityPoints: 2870,
  },
  tournaments: {
    played: 37,
    won: 9,
    bestPlace: 1,
    winRate: 24.3,
    lcWon: 1_284_500,
  },
  lifetime: {
    ticketsClaimed: 412,
    lcEarned: 4_918_300,
    starsSpent: 1_640,
    referrals: 7,
  },
};

export const profileMock = {
  'GET profile/stats': () => playerStats,
  profile: {
    me: ownProfile,
    'user-1': ownProfile,
    'user-2': otherProfile,
    'user-3': strangerProfile,
  },
  'POST profile/like': likeProfileHandler,
  'POST profile/send-ticket': sendTicketHandler,
  'POST profile/showcase/buy-slot': buyShowcaseSlotHandler,
  'POST profile/collage/pin': collagePinHandler,
  'POST profile/collage/unpin': collageUnpinHandler,
  'POST profile/invite-tournament': inviteToTournamentHandler,
  'PATCH profile/banner-icons': updateBannerIconsHandler,
};
