import type { TicketType } from '@/types/types/ticket.types';

export interface ClaimableTicket {
  type: TicketType;
  amount: number;
}

export interface InvitedFriend {
  id: string;
  username: string;
  avatar: string;
  isLuckyPlayer: boolean;
  isVerified: boolean;
  isTelegramPremium?: boolean;
  points: number;
  claimableTickets: ClaimableTicket[];
  isVIP?: boolean;
  liked: boolean;
  likesReceived: number;
}

export interface ReferralStats {
  totalInvited: number;
}
