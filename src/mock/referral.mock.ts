import { images } from '@/constants/images';
import {
  InvitedFriend,
  PreLaunchGiftState,
  PreparedShareMessage,
  ReferralStats,
} from '@/types/interfaces/referral.interfaces';
import { appConfig } from '@/config/app.config';
import { comingSoonConfig } from '@/config/coming-soon.config';

const LOCAL_AVATARS = [
  images.avatar1.src,
  images.avatar2.src,
  images.avatar3.src,
  images.avatar4.src,
  images.avatar5.src,
  images.avatar6.src,
  images.avatarYerevan.src,
  images.avatar.src,
];

const avatar = (seed: number) => LOCAL_AVATARS[seed % LOCAL_AVATARS.length];

const baseFriends: Omit<InvitedFriend, 'liked' | 'likesReceived'>[] = [
  {
    id: '1',
    claimableLc: 4820,
    // The rare friend who actually builds: brought people AND some of them
    // have won. On prod only ~10% of invited players ever invite anybody.
    broughtCount: 7,
    branchLc: 1240,
    username: 'john_doe',
    displayName: 'Джон 🎰',
    avatar: avatar(12),
    isLuckyPlayer: false,
    isVerified: true,
    isVIP: true,
    isTelegramPremium: false,
    points: 1500,
    // Leftover from the ticket commission the LC reward replaced — kept on two
    // friends only, because it drains to zero and never refills.
    claimableTickets: [
      { type: 'bronze', amount: 3 },
      { type: 'silver', amount: 1 },
    ],
  },
  {
    id: '2',
    claimableLc: 1150,
    username: 'jane_smith',
    displayName: 'Jane Smith-Wolfenberger the Third',
    avatar: avatar(45),
    isLuckyPlayer: false,
    isVerified: false,
    isTelegramPremium: false,
    points: 800,
    claimableTickets: [],
  },
  {
    id: '3',
    claimableLc: 12400,
    username: 'alex_wilson',
    displayName: '(.)',
    avatar: avatar(7),
    isLuckyPlayer: true,
    isVerified: false,
    isTelegramPremium: true,
    points: 2000,
    claimableTickets: [],
  },
  {
    id: '4',
    claimableLc: 0,
    username: 'sarah_jones',
    avatar: avatar(32),
    isLuckyPlayer: false,
    isVerified: true,
    isTelegramPremium: false,
    points: 1200,
    claimableTickets: [],
  },
  {
    id: '5',
    claimableLc: 27650,
    // The COMMON shape, and the one the layout has to survive: a visible
    // branch that has produced nothing yet, because tournament prizes reach a
    // small fraction of players. A big count beside an empty amount is the
    // realistic case, not the polished one.
    broughtCount: 12,
    branchLc: 0,
    username: 'mike_brown',
    avatar: avatar(60),
    isLuckyPlayer: true,
    isVerified: true,
    isTelegramPremium: true,
    isVIP: true,
    points: 3200,
    claimableTickets: [],
  },
  {
    id: '6',
    claimableLc: 0,
    username: 'lina_park',
    avatar: avatar(48),
    isLuckyPlayer: false,
    isVerified: false,
    isTelegramPremium: true,
    points: 540,
    claimableTickets: [],
  },
  {
    id: '7',
    claimableLc: 3090,
    broughtCount: 2,
    branchLc: 260,
    username: 'omar_amini',
    avatar: avatar(15),
    isLuckyPlayer: true,
    isVerified: true,
    isTelegramPremium: false,
    points: 980,
    claimableTickets: [{ type: 'silver', amount: 4 }],
  },
  // Ten names against a seven-step ladder, on purpose: the screen has to be
  // able to say «7 из 10 в канале», and a roster the same size as the
  // requirement made that sentence impossible to check in dev.
  {
    id: '8',
    claimableLc: 0,
    username: 'nina_vardan',
    avatar: avatar(21),
    isLuckyPlayer: false,
    isVerified: true,
    isTelegramPremium: false,
    points: 640,
    claimableTickets: [],
  },
  {
    id: '9',
    claimableLc: 480,
    username: 'petros_k',
    avatar: avatar(53),
    isLuckyPlayer: false,
    isVerified: false,
    isTelegramPremium: true,
    points: 310,
    claimableTickets: [],
  },
  {
    id: '10',
    claimableLc: 6200,
    username: 'karen_a',
    avatar: avatar(38),
    isLuckyPlayer: true,
    isVerified: false,
    isTelegramPremium: false,
    points: 1750,
    claimableTickets: [],
  },
];

/**
 * Who arrived through the link but is not a referral right now.
 *
 * Friend `3` is the fixture that matters: he has the second-largest LC pile on
 * the roster AND does not count, so the frozen row — earned money the player
 * cannot take until he comes back — is on screen in dev without anyone having
 * to construct it.
 */
const MOCK_NOT_COUNTED = new Set(['2', '3', '4']);

// Level-zero: no invited friends yet (the demo roster stays in `baseFriends`).
export const invitedFriendsMock: InvitedFriend[] = appConfig.account.fresh
  ? []
  : baseFriends.map((friend, i) => ({
      ...friend,
      liked: i % 4 === 1,
      likesReceived: 35 + i * 44,
      countsAsReferral: !MOCK_NOT_COUNTED.has(friend.id),
    }));

export const referralStatsMock: ReferralStats = {
  totalInvited: invitedFriendsMock.length,
  // No `counted` here on purpose — it is derived from the friends roster, so
  // that a fixture cannot state a number the list disagrees with.
  // @see useReferralCounts
  // Both rules on, as they are in production — the screen states them as
  // conditions.
  requireChannelSubscription: true,
  requireBotNotBlocked: true,
};

export const preparedShareMessageMock: PreparedShareMessage = {
  id: 'mock-prepared-message-id',
};

/**
 * Friends who arrived but do not count toward the promo — the same three the
 * friends list marks, read off the one map above rather than re-derived here.
 * Two fixtures disagreeing about who is in the channel is a state production
 * cannot be in, and it made the screens impossible to compare in dev.
 *
 * The counted number stays DIFFERENT from the roster length on purpose. A
 * fixture where they coincide hid a real bug: the list header printed «7 из 7»
 * to a player with ten friends, because its denominator was the requirement
 * instead of the roster.
 */
const notCountedFriendIds = invitedFriendsMock
  .filter(friend => !friend.countsAsReferral)
  .map(friend => friend.id);
const countedFriends = invitedFriendsMock.length - notCountedFriendIds.length;

/**
 * The pre-launch gift, tracking the demo roster.
 *
 * `status: null` with the ladder full is the *normal* state now, not an edge
 * case: nothing is filed until the player presses the gift, so the fixture that
 * matters is "earned it, hasn't asked" — the one that renders the glowing
 * claim. A fixture that arrived pre-claimed would hide the button entirely.
 */
const eligible = countedFriends >= comingSoonConfig.giftFriendsRequired;
const dailyRemaining = 2;

export const preLaunchGiftMock: PreLaunchGiftState = {
  required: comingSoonConfig.giftFriendsRequired,
  status: null,
  emoji: null,
  counted: countedFriends,
  notCountedFriendIds,
  // On, as it is in production — the ladder states it as a condition.
  requireChannelSubscription: true,
  // Today's board, mid-day: enough left to still be a race.
  dailyLimit: 5,
  dailyRemaining,
  eligible,
  canClaim: eligible && dailyRemaining > 0,
};

export const referralMock = {
  'referral/friends': invitedFriendsMock,
  'referral/stats': referralStatsMock,
  'referral/prelaunch-gift': preLaunchGiftMock,
  'POST referral/prepare-share': preparedShareMessageMock,
  // A friend's reward is claimed per id — `referral/claim/:friendId` — and the
  // resolver has no wildcards, so the keys come from the roster. `baseFriends`,
  // not `invitedFriendsMock`: the latter is empty for a fresh account, and the
  // handler should exist either way.
  ...Object.fromEntries(
    baseFriends.map(friend => [`POST referral/claim/${friend.id}`, () => ({})])
  ),
  'POST referral/shared': () => {
    console.log('[mock] referral/shared — player sent a referral share');
    return { ok: true };
  },
};
