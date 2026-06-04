import { images } from '@/constants/images';
import { InvitedFriend, ReferralStats } from '@/types/interfaces/referral.interfaces';
import { appConfig } from '@/config/app.config';

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

export const referralMock = {
  'referral/friends': invitedFriendsMock,
  'referral/stats': referralStatsMock,
};
