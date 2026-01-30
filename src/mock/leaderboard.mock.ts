import { faker } from '@faker-js/faker';
import type { LeaderboardEntry } from '@/types/interfaces/leaderboard.interfaces';
import { images } from '@/constants/images';
import meMock from '@/mock/me.mock';

const { me } = meMock;

export const leaderboard: LeaderboardEntry[] = Array.from({ length: 20 }, (_, index) => ({
  username: faker.internet.username(),
  points: faker.number.int({ min: 900 - 9 * index, max: 900 - 9 * (index - 1) }),
  avatar: images.avatar.src,
  rankChange: faker.number.int({ min: -index, max: index }),
  place: index + 1,
  isVerified: faker.datatype.boolean(),
  isPrime: faker.datatype.boolean(),
}));

const myPlace = {
  username: me.username,
  points: 750,
  avatar: me.avatar,
  rankChange: 2,
  place: faker.number.int({ min: 1, max: 40 }),
  isVerified: me.isVerified,
  isPrime: me.isPrime,
};

if (myPlace.place < 20) {
  leaderboard.splice(myPlace.place - 1, 1, myPlace);
}

export const leaderboardMock = {
  leaderboard: {
    places: leaderboard,
    myPlace,
  },
};
