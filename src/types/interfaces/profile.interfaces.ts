import type { Achievement } from '@/types/interfaces/achievement.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface ProfileStreak {
  days: number;
  active: boolean;
}

export interface ProfilePublicStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  stakesCompleted: number;
  ticketsSent: number;
  friendsCount: number;
  totalAchievements: number;
  earnedAchievements: number;
  likesReceived: number;
}

export interface ProfilePrivateStats {
  lc: number;
  ls: number;
  ton: number;
  ticketsByTier: Partial<Record<TicketType, number>>;
}

export interface ProfileFriendPreview {
  id: string;
  username: string;
  /** Telegram name, when it should be shown instead of `username`. @see displayNameOf */
  displayName?: string;
  avatar?: string;
}

/** Banner collage icon position, stored as a percentage of the banner box. */
export interface BannerIconPosition {
  left: number;
  top: number;
}

export type ActivityBestPeriod = 'day' | 'week' | 'month' | 'all_time';

export interface ActivityBest {
  day: number;
  dayRank: number;
  week: number;
  weekRank: number;
  month: number;
  monthRank: number;
  allTime: number;
  allTimeRank: number;
}

export interface ProfileResponse {
  id: string;
  username: string;
  /** Telegram name, when it should be shown instead of `username`. @see displayNameOf */
  displayName?: string;
  avatar: string;
  banner?: string;
  isVerified: boolean;
  isLuckyPlayer: boolean;
  isVIP: boolean;
  vipLevel: number;
  activityPoints: number;
  /** Activated referrals (cumulative) — second half of the tier gate (DOCS §5.1). */
  referralsCount?: number;
  activityBest: ActivityBest;
  ticketsEarned: number;
  memberSince: string;
  streak: ProfileStreak;
  showcaseSlots: number;
  showcaseMaxSlots: number;
  pinnedAchievements: Achievement[];
  collageAchievements: Achievement[];
  friendsPreview: ProfileFriendPreview[];
  publicStats: ProfilePublicStats;
  privateStats?: ProfilePrivateStats;
  recentAchievements: Achievement[];
  isOwn: boolean;
  /** The viewed player joined through the viewer's link — gates the tournament invite (DOCS §17.3.3). */
  isMyReferral?: boolean;
  liked: boolean;
  canLikeAt?: string;
  /** Per-icon banner collage positions (keyed by icon id). Owner-editable, public. */
  bannerIconPositions?: Record<string, BannerIconPosition>;
}

export interface LikeProfileResponse {
  likesReceived: number;
  liked: boolean;
  canLikeAt: string;
}

export interface BuyShowcaseSlotRequest {
  targetSlot: number;
}

export interface InviteToTournamentRequest {
  userId: string;
  tournamentId: string;
}

export interface InviteToTournamentResponse {
  success: boolean;
  invitationId: string;
}

export interface SendTicketRequest {
  userId: string;
  tier: TicketType;
  quantity: number;
}

export interface SendTicketResponse {
  success: boolean;
}

export interface UpdateBannerIconsRequest {
  positions: Record<string, BannerIconPosition>;
}

/**
 * Lifetime numbers for the player's own stats screen (`GET /profile/stats`).
 *
 * All-time on purpose: the profile already shows the current picture, so what
 * it cannot answer is "how far have I come". `bestPlace` and `winRate` are null
 * until there is a finished tournament to speak of — a best place of 0 is
 * nonsense, and an empty history deserves a dash, not a zero.
 */
export interface PlayerStats {
  /** Registration timestamp, ISO. */
  since: string;
  activity: {
    daysActive: number;
    currentStreak: number;
    longestStreak: number;
    activityPoints: number;
  };
  tournaments: {
    played: number;
    /** Top-3 finishes. */
    won: number;
    bestPlace: number | null;
    winRate: number | null;
    lcWon: number;
  };
  lifetime: {
    ticketsClaimed: number;
    lcEarned: number;
    starsSpent: number;
    referrals: number;
  };
}
