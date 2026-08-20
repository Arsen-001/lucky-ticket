import { images } from '@/constants/images';
import {
  BranchMember,
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

/**
 * The reason the screen actually reads. Three of the four are the friend's own
 * doing and render identically; `burned` is the one that must not be confused
 * with them — it means THIS player blocked the bot and their own referrals were
 * wiped, and it rewrites the note above the list.
 *
 * Left as the friend-side reason here so dev shows the ordinary case by
 * default. Swap it to `'burned'` to see the burn wording.
 * @see FriendsQualificationNote
 */
const MOCK_NOT_COUNTED_REASON = 'not-in-channel' as const;

// Level-zero: no invited friends yet (the demo roster stays in `baseFriends`).
export const invitedFriendsMock: InvitedFriend[] = appConfig.account.fresh
  ? []
  : baseFriends.map((friend, i) => ({
      ...friend,
      liked: i % 4 === 1,
      likesReceived: 35 + i * 44,
      countsAsReferral: !MOCK_NOT_COUNTED.has(friend.id),
      ...(MOCK_NOT_COUNTED.has(friend.id) ? { notCountedReason: MOCK_NOT_COUNTED_REASON } : {}),
    }));

const BRANCH_NAMES = [
  'ruben_t',
  'ani.k',
  'davit_99',
  'mher',
  'sona_x',
  'tigran.b',
  'lilit',
  'gor_a',
  'narek',
  'meline',
  'vahe_k',
  'arpi',
];

/**
 * Who each friend went on to invite — the second level, keyed by friend id.
 *
 * Sized from each friend's own `broughtCount` so the badge on a row and the
 * list it opens can never disagree. Most branches are empty on purpose: on
 * prod only 20 players out of 876 have a second level at all, so a fixture
 * where everyone has one would hide exactly the state most players see.
 */
const branchOf = (friendId: string, size: number): BranchMember[] =>
  Array.from({ length: size }, (_, i) => ({
    id: `${friendId}-b${i + 1}`,
    username: BRANCH_NAMES[(Number(friendId) * 3 + i) % BRANCH_NAMES.length],
    avatar: avatar(Number(friendId) * 7 + i * 5),
    points: 120 + ((i * 137) % 900),
    isVerified: i % 3 === 0,
    isLuckyPlayer: i % 5 === 0,
    isVIP: i === 0 && friendId === '1',
    // Spread back from "now" by whole days, but as a FIXED string per row:
    // a fixture computed from the clock makes every screenshot differ.
    joinedAt: `2026-08-${String(2 + (i % 8)).padStart(2, '0')}T12:00:00.000Z`,
    // The third level exists as a number and nothing more — the reward stops
    // at the second, so there is no deeper list to open.
    broughtCount: i === 0 ? 2 : 0,
  }));

export const friendBranchesMock: Record<string, BranchMember[]> = Object.fromEntries(
  baseFriends.map(friend => [friend.id, branchOf(friend.id, friend.broughtCount ?? 0)])
);

/**
 * The flat «Их друзья» tab: every branch at once, each row stamped with the
 * friend it came through. Built from the same per-friend branches the
 * dropdowns show, so the tab badge, the row badges and the two lists cannot
 * drift apart.
 */
export const referralNetworkMock: BranchMember[] = baseFriends.flatMap(friend =>
  (friendBranchesMock[friend.id] ?? []).map(member => ({
    ...member,
    viaFriendId: friend.id,
    viaName: friend.displayName ?? friend.username,
  }))
);

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
  // The event is open and this player has no gift yet — the state that renders
  // the card. `false` is what the server sends once they have one, and the
  // whole block disappears.
  available: true,
  required: comingSoonConfig.giftFriendsRequired,
  status: null,
  emoji: null,
  // What the promo is set to hand out — an admin setting on the server, so the
  // fixture carries it too; without it the screen would silently fall back to
  // its own default and the mock would stop exercising the live path.
  giftEmoji: '💝',
  // Null on purpose: in production this is a base64 sticker from Telegram, and
  // null is the state the screen has to survive — it falls back to the emoji.
  giftImage: null,
  counted: countedFriends,
  notCountedFriendIds,
  // On, as it is in production — the ladder states it as a condition.
  requireChannelSubscription: true,
  // Оба условия включены, как на проде: иначе в dev не видно фразы,
  // которая называет правило целиком.
  requireBotNotBlocked: true,
  // Today's board, mid-day: enough left to still be a race.
  dailyLimit: 5,
  dailyRemaining,
  eligible,
  canClaim: eligible && dailyRemaining > 0,
};

export const referralMock = {
  'referral/friends': invitedFriendsMock,
  'referral/network': referralNetworkMock,
  'referral/stats': referralStatsMock,
  'referral/prelaunch-gift': preLaunchGiftMock,
  // Pressing it locally files nothing on a server — the fixture answers with
  // the state a real claim would produce, so the card can be walked end to end
  // on mocks. @see FriendsGiftEventCard
  'POST referral/prelaunch-gift/claim': (): PreLaunchGiftState => ({
    ...preLaunchGiftMock,
    status: 'PENDING',
    canClaim: false,
  }),
  'POST referral/prepare-share': preparedShareMessageMock,
  // A friend's reward is claimed per id — `referral/claim/:friendId` — and the
  // resolver has no wildcards, so the keys come from the roster. `baseFriends`,
  // not `invitedFriendsMock`: the latter is empty for a fresh account, and the
  // handler should exist either way.
  ...Object.fromEntries(
    baseFriends.map(friend => [`POST referral/claim/${friend.id}`, () => ({})])
  ),
  // Same reason as the claim keys above: a branch is read per friend id and the
  // resolver has no wildcards, so every friend gets a key — including the ones
  // whose branch is empty, which is most of them.
  ...Object.fromEntries(
    baseFriends.map(friend => [
      `referral/friends/${friend.id}/branch`,
      friendBranchesMock[friend.id] ?? [],
    ])
  ),
  'POST referral/shared': () => {
    console.log('[mock] referral/shared — player sent a referral share');
    return { ok: true };
  },
};
