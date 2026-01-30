import { faker } from '@faker-js/faker';
import type { LeaderboardEntry } from '@/types/interfaces/leaderboard.interfaces';
import { images } from '@/constants/images';

export const leaderboard: LeaderboardEntry[] = Array.from({ length: 20 }, (_, index) => ({
  username: faker.internet.username(),
  points: faker.number.int({ min: 900 - 9 * index, max: 900 - 9 * (index - 1) }),
  avatar: images.avatar.src,
  rankChange: faker.number.int({ min: -index, max: index }),
  place: index + 1,
  isVerified: faker.datatype.boolean(),
  isPrime: faker.datatype.boolean(),
}));

export const leaderboardMock = {
  leaderboard: {
    places: leaderboard,
    myPlace: {
      username: 'Arsen 001',
      points: 750,
      avatar: images.avatar.src,
      rankChange: 2,
      place: 42,
      isVerified: true,
      isPrime: false,
    },
  },
};
