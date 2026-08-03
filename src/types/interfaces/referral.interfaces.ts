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

/** Server-prepared rich invite message (image + caption + button), created via
 *  Bot API `savePreparedInlineMessage` and sent with `WebApp.shareMessage(id)`. */
export interface PreparedShareMessage {
  id: string;
}

/**
 * Where the player stands on the pre-launch gift promised for bringing five
 * friends (`GET referral/prelaunch-gift`).
 *
 * `null` status means no claim exists — either they are still short of the
 * threshold, or the promo did not apply when they crossed it. Nothing is owed
 * until the backend has filed a row, so the screen must not promise on a null.
 */
export type PreLaunchGiftStatus = 'PENDING' | 'APPROVED' | 'SENT' | 'REJECTED' | 'FAILED';

export interface PreLaunchGiftState {
  /**
   * The backend's own threshold. The ladder is drawn from
   * `comingSoonConfig.giftFriendsRequired` instead — a server value would make
   * the step count change under the player mid-load — so this is here as the
   * contract, kept equal by the guardrail suite rather than read at runtime.
   */
  required: number;
  status: PreLaunchGiftStatus | null;
  /** Which gift actually arrived. Only ever set once `status` is `SENT`. */
  emoji: string | null;
}
