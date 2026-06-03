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
  ticketsByTier: Partial<Record<string, number>>;
}

export interface ProfileFriendPreview {
  id: string;
  username: string;
  avatar?: string;
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
  avatar: string;
  banner?: string;
  isVerified: boolean;
  isLuckyPlayer: boolean;
  isVIP: boolean;
  vipLevel: number;
  activityPoints: number;
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
  liked: boolean;
  canLikeAt?: string;
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
