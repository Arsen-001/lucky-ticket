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
    username: 'john_doe',
    avatar: avatar(12),
    isLuckyPlayer: false,
    isVerified: true,
    isVIP: true,
    isTelegramPremium: false,
    points: 1500,
    claimableTickets: [
      { type: 'bronze', amount: 3 },
      { type: 'silver', amount: 1 },
    ],
  },
  {
    id: '2',
    username: 'jane_smith',
    avatar: avatar(45),
    isLuckyPlayer: false,
    isVerified: false,
    isTelegramPremium: false,
    points: 800,
    claimableTickets: [{ type: 'bronze', amount: 2 }],
  },
  {
    id: '3',
    username: 'alex_wilson',
    avatar: avatar(7),
    isLuckyPlayer: true,
    isVerified: false,
    isTelegramPremium: true,
    points: 2000,
    claimableTickets: [
      { type: 'bronze', amount: 6 },
      { type: 'silver', amount: 2 },
      { type: 'gold', amount: 1 },
      { type: 'platinum', amount: 1 },
    ],
  },
  {
    id: '4',
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
    username: 'mike_brown',
    avatar: avatar(60),
    isLuckyPlayer: true,
    isVerified: true,
    isTelegramPremium: true,
    isVIP: true,
    points: 3200,
    claimableTickets: [
      { type: 'gold', amount: 2 },
      { type: 'diamond', amount: 1 },
    ],
  },
  {
    id: '6',
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
    username: 'omar_amini',
    avatar: avatar(15),
    isLuckyPlayer: true,
    isVerified: true,
    isTelegramPremium: false,
    points: 980,
    claimableTickets: [{ type: 'silver', amount: 4 }],
  },
];

// Level-zero: no invited friends yet (the demo roster stays in `baseFriends`).
export const invitedFriendsMock: InvitedFriend[] = appConfig.account.fresh
  ? []
  : baseFriends.map((friend, i) => ({
      ...friend,
      liked: i % 4 === 1,
      likesReceived: 35 + i * 44,
    }));

export const referralStatsMock: ReferralStats = {
  totalInvited: invitedFriendsMock.length,
};

export const preparedShareMessageMock: PreparedShareMessage = {
  id: 'mock-prepared-message-id',
};

/**
 * One friend who arrived but never joined the channel — the state that has to
 * be visible somewhere, because a roster that always counts in full hides the
 * only rule a player can actually get wrong.
 */
const notCountedFriendIds = invitedFriendsMock.slice(1, 2).map(friend => friend.id);
const countedFriends = invitedFriendsMock.length - notCountedFriendIds.length;

/**
 * The pre-launch gift, tracking the demo roster: with the full roster the
 * threshold is long past, so the claim is filed and waiting for an admin —
 * which is the state the ladder's copy is most easily got wrong in. Level-zero
 * has no friends and therefore nothing filed.
 */
export const preLaunchGiftMock: PreLaunchGiftState = {
  required: comingSoonConfig.giftFriendsRequired,
  status: countedFriends >= comingSoonConfig.giftFriendsRequired ? 'PENDING' : null,
  emoji: null,
  counted: countedFriends,
  notCountedFriendIds,
  // Today's board, mid-day: enough left to still be a race.
  dailyLimit: 5,
  dailyRemaining: 2,
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
