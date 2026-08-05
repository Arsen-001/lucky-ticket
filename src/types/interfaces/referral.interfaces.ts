import type { TicketType } from '@/types/types/ticket.types';

export interface ClaimableTicket {
  type: TicketType;
  amount: number;
}

/**
 * Why an invited friend is a friend but not a referral.
 *
 * `unknown` is NOT «не в канале»: it is Telegram refusing to answer (an
 * outage, a 429, a bot that can't see the channel). The row says so in those
 * words — telling someone their friend left when we simply could not ask
 * accuses a real player of something they did not do, and unlike the other two
 * reasons there is nothing the inviter can act on.
 */
export type ReferralDisqualification = 'not-in-channel' | 'bot-blocked' | 'unknown';

export interface InvitedFriend {
  id: string;
  username: string;
  /** Telegram name, when it should be shown instead of `username`. @see displayNameOf */
  displayName?: string;
  avatar: string;
  isLuckyPlayer: boolean;
  isVerified: boolean;
  isTelegramPremium?: boolean;
  points: number;
  claimableTickets: ClaimableTicket[];
  isVIP?: boolean;
  liked: boolean;
  likesReceived: number;
  /**
   * Counts toward the referral number right now — in the channel, and hasn't
   * blocked the bot. Everyone on this list is a FRIEND regardless; this is the
   * narrower thing. `undefined` = a backend too old to say, which must read as
   * "counts" rather than painting every existing friend as disqualified.
   */
  countsAsReferral?: boolean;
  /** Set exactly when `countsAsReferral` is false. @see ReferralDisqualification */
  notCountedReason?: ReferralDisqualification | null;
}

export interface ReferralStats {
  /** Everyone who ever arrived through the link. Permanent; unlocks tiers. */
  totalInvited: number;
  /**
   * Is the channel rule on? Off ⇒ the screen stops stating it as a condition.
   * Config, not a count — which is why it lives here and the referral COUNT
   * does not: that is derived from the friends list. @see useReferralCounts
   */
  requireChannelSubscription?: boolean;
  /** Is the bot-block rule on? */
  requireBotNotBlocked?: boolean;
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
  /**
   * Is the channel rule on? The ladder prints it as a condition, so an admin
   * switching it off must take the sentence down with it. Undefined = a backend
   * too old to say, and the rule has been on the whole time it existed.
   */
  requireChannelSubscription?: boolean;
  /** Places on today's board; `0` means the promo is closed today. */
  dailyLimit?: number | null;
  /** Places still free today. */
  dailyRemaining?: number | null;
  /**
   * The ladder is full — this player has earned the right to ask. Stays true on
   * a day with no places left, which is exactly the difference between «ещё не
   * заслужил» and «заслужил, но сегодня опоздал».
   */
  eligible?: boolean;
  /**
   * Pressing the gift right now would file a claim. The server's answer, not
   * the screen's guess: it already weighs the places, the channel rule and an
   * existing claim, so the button lights up only when it would work. Absent on
   * a backend that predates the button — the gift then stays locked, which
   * promises nothing.
   */
  canClaim?: boolean;
}
