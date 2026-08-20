import type { TicketType } from '@/types/types/ticket.types';

export interface ClaimableTicket {
  type: TicketType;
  amount: number;
}

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
  /**
   * The referral reward waiting on this friend: your cut of the LC they have
   * won in tournaments (DOCS §17.2). `undefined` = a backend too old to send
   * it, which must read as zero rather than as a broken row.
   *
   * Only claimable while they still count as a referral — the money freezes
   * rather than burns, and unfreezes if they come back. @see countsAsReferral
   */
  claimableLc?: number;
  /**
   * The SECOND level: your cut of what everyone THIS friend invited has won,
   * pooled into one number (DOCS §17.2).
   *
   * Deliberately never broken down per person — you have no relationship with
   * the players in a friend's branch and the screen does not name them. It is
   * paid by the same button and frozen by the same verdict as the friend's own
   * reward, because the branch only exists through them.
   */
  branchLc?: number;
  /**
   * How many people this friend went on to invite. Always rendered, `0`
   * included: on prod only 20 players out of 876 have any second level at all
   * (measured 2026-08-10), so a badge that appeared only above zero was a
   * mechanic nobody could discover. Who those people are loads on demand.
   * @see BranchMember
   */
  broughtCount?: number;
  /**
   * LEGACY: leftover commission from the ticket rule this replaced. Nothing
   * accrues here any more; it drains to zero as people claim it, and the UI
   * shows it only while a friend still has some.
   */
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
  /**
   * Why this friend does not count, when they don't.
   *
   * The screen deliberately does not print three of these four — «не в канале»,
   * «заблокировал бота», «не смогли спросить» are the friend's own doing and
   * the rule above the list already covers them. `burned` is the exception and
   * has to be told apart: it means THIS player blocked the bot and their own
   * referrals were wiped, so the shared explainer («реферал засчитывается, пока
   * ОН подписан…») would blame the friends for something their inviter did.
   * @see FriendsQualificationNote
   */
  notCountedReason?: 'not-in-channel' | 'bot-blocked' | 'unknown' | 'burned';
}

/**
 * One person from a friend's branch — someone that friend invited, i.e. the
 * second level (`GET referral/friends/:friendId/branch`).
 *
 * Carries no money of its own: the branch pays as one pooled figure through
 * the friend it hangs off, so a per-person amount here would imply a claim
 * that does not exist. @see InvitedFriend.branchLc
 */
export interface BranchMember {
  id: string;
  username: string;
  displayName?: string;
  avatar: string;
  points: number;
  isVerified: boolean;
  isLuckyPlayer: boolean;
  isVIP?: boolean;
  /** ISO timestamp of when they joined through that friend's link. */
  joinedAt: string;
  /** How many they brought in turn — a number only; the reward stops here. */
  broughtCount?: number;
  /**
   * Which of YOUR friends brought them. Only sent by the flat «Их друзья» list
   * (`GET referral/network`), where it is the row's one anchor — inside a
   * single friend's dropdown the answer is already the row above.
   */
  viaFriendId?: string;
  viaName?: string;
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
 * Where the player stands on the gift promised for bringing friends
 * (`GET referral/prelaunch-gift`).
 *
 * `null` status means no claim exists — either they are still short of the
 * threshold, or the promo did not apply when they crossed it. Nothing is owed
 * until the backend has filed a row, so the screen must not promise on a null.
 */
export type PreLaunchGiftStatus = 'PENDING' | 'APPROVED' | 'SENT' | 'REJECTED' | 'FAILED';

export interface PreLaunchGiftState {
  /**
   * Is there a promo here for this player at all? `false` = draw NOTHING: it is
   * switched off, or they already have their gift. One answer instead of three
   * booleans, the same shape the invite-screen roulette uses.
   *
   * Undefined = a backend too old to say. Treated as "show it": that backend
   * predates the friends-screen event, and the only screen asking it then was
   * the countdown, which always drew the ladder.
   */
  available?: boolean;
  /**
   * The threshold the backend is CURRENTLY filing claims at — a panel setting
   * since 20.08.2026, so the ladder reads it here and falls back to
   * `comingSoonConfig.giftFriendsRequired` only until the answer arrives. The
   * two are kept equal by the guardrail suite so that fallback is never a
   * different promise.
   */
  required: number;
  status: PreLaunchGiftStatus | null;
  /** Which gift actually arrived. Only ever set once `status` is `SENT`. */
  emoji: string | null;
  /**
   * Which gift the promo is set to send RIGHT NOW — the promise, where `emoji`
   * is the history. An admin setting since 13.08.2026, when Telegram retired
   * the gift the screen had hardcoded and the bot could not send it to anyone.
   * Undefined = a backend too old to say; the screen falls back to its own
   * default. @see GiftLadder
   */
  giftEmoji?: string | null;
  /**
   * The promo gift's own sticker, as a `data:` URI. Preferred over the emoji
   * wherever it is present: Telegram's `sticker.emoji` does not identify a gift
   * (its teddy bear reports '🎂'), so the emoji alone can promise the wrong
   * present. Undefined/null = draw the emoji, as before.
   */
  giftImage?: string | null;
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
