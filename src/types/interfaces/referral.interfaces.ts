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
  /**
   * Friends that COUNT toward the ladder — invited *and* subscribed to the
   * channel, which is the rule the backend files claims by. The ladder draws
   * this, not the length of the friends list, or the screen would promise a
   * gift that is never filed. `null` = a backend too old to say; fall back to
   * the list length rather than showing a zero.
   */
  counted?: number | null;
  /** Ids of invited friends that do not count yet — the list marks them. */
  notCountedFriendIds?: string[];
  /** Places on today's board; `0` means the promo is closed today. */
  dailyLimit?: number | null;
  /** Places still free today. */
  dailyRemaining?: number | null;
}
