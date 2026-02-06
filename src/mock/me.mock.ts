import { images } from '@/constants/images';
import type { MeResponse } from '@/types/interfaces/user.interfaces';
import { faker } from '@faker-js/faker';

export const me: MeResponse = {
  id: faker.string.uuid(),
  username: 'Arsen 001',
  email: 'arsen@gmai.com',
  isPrime: true,
  isVIP: true,
  isVerified: true,
  avatar: images.avatar.src,
  coins: 537,
  points: 750,
  phoneNumber: '+37411111111',
  twoFactorAuth: true,
  activityPoints: 750,
};

const meMock = { me };
export default meMock;
