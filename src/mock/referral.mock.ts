import { InvitedFriend, ReferralStats } from '@/types/interfaces/referral.interfaces';
import { images } from '@/constants/images';

export const invitedFriendsMock: InvitedFriend[] = [
  {
    id: '1',
    username: 'john_doe',
    avatar: images.avatar.src,
    isPrime: true,
    isVerified: true,
    points: 1500,
    earnedCoins: 300,
  },
  {
    id: '2',
    username: 'jane_smith',
    avatar: images.avatar.src,
    isPrime: false,
    isVerified: false,
    points: 800,
    earnedCoins: 80,
  },
  {
    id: '3',
    username: 'alex_wilson',
    avatar: images.avatar.src,
    isPrime: true,
    isVerified: false,
    points: 2000,
    earnedCoins: 400,
  },
  {
    id: '4',
    username: 'sarah_jones',
    avatar: images.avatar.src,
    isPrime: false,
    isVerified: true,
    points: 1200,
    earnedCoins: 120,
  },
];

export const referralStatsMock: ReferralStats = {
  totalInvited: invitedFriendsMock.length,
  totalEarned: invitedFriendsMock.reduce((total, friend) => total + friend.earnedCoins, 0),
};

export const referralMock = {
  'referral/friends': invitedFriendsMock,
  'referral/stats': referralStatsMock,
};
