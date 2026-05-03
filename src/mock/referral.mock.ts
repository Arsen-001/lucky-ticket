import { InvitedFriend, ReferralStats } from '@/types/interfaces/referral.interfaces';

const avatar = (seed: number) => `https://i.pravatar.cc/200?img=${seed}`;

export const invitedFriendsMock: InvitedFriend[] = [
  {
    id: '1',
    username: 'john_doe',
    avatar: avatar(12),
    isPrime: false,
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
    isPrime: false,
    isVerified: false,
    isTelegramPremium: false,
    points: 800,
    claimableTickets: [{ type: 'bronze', amount: 2 }],
  },
  {
    id: '3',
    username: 'alex_wilson',
    avatar: avatar(7),
    isPrime: true,
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
    isPrime: false,
    isVerified: true,
    isTelegramPremium: false,
    points: 1200,
    claimableTickets: [],
  },
  {
    id: '5',
    username: 'mike_brown',
    avatar: avatar(60),
    isPrime: true,
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
    isPrime: false,
    isVerified: false,
    isTelegramPremium: true,
    points: 540,
    claimableTickets: [],
  },
  {
    id: '7',
    username: 'omar_amini',
    avatar: avatar(15),
    isPrime: true,
    isVerified: true,
    isTelegramPremium: false,
    points: 980,
    claimableTickets: [{ type: 'silver', amount: 4 }],
  },
];

export const referralStatsMock: ReferralStats = {
  totalInvited: invitedFriendsMock.length,
};

export const referralMock = {
  'referral/friends': invitedFriendsMock,
  'referral/stats': referralStatsMock,
};
