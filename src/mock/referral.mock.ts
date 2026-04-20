import { InvitedFriend, ReferralStats } from '@/types/interfaces/referral.interfaces';
import { images } from '@/constants/images';

export const invitedFriendsMock: InvitedFriend[] = [
  {
    id: '1',
    username: 'john_doe',
    avatar: images.avatar.src,
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
    avatar: images.avatar.src,
    isPrime: false,
    isVerified: false,
    isTelegramPremium: false,
    points: 800,
    claimableTickets: [{ type: 'bronze', amount: 2 }],
  },
  {
    id: '3',
    username: 'alex_wilson',
    avatar: images.avatar.src,
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
    avatar: images.avatar.src,
    isPrime: false,
    isVerified: true,
    isTelegramPremium: false,
    points: 1200,
    claimableTickets: [],
  },
];

export const referralStatsMock: ReferralStats = {
  totalInvited: invitedFriendsMock.length,
};

export const referralMock = {
  'referral/friends': invitedFriendsMock,
  'referral/stats': referralStatsMock,
};
