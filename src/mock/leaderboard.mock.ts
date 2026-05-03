import { faker } from '@faker-js/faker';
import meMock from '@/mock/me.mock';
import type {
  LeaderboardEntry,
  LeaderboardPeriod,
  LeaderboardResponse,
} from '@/types/interfaces/leaderboard.interfaces';

const { me } = meMock;

const TOTAL_BY_PERIOD: Record<LeaderboardPeriod, number> = {
  today: 4_120,
  week: 9_587,
  month: 18_204,
  all: 47_309,
};

const MY_RANK_BY_PERIOD: Record<LeaderboardPeriod, number> = {
  today: 14,
  week: 73,
  month: 147,
  all: 312,
};

const POINTS_FLOOR_BY_PERIOD: Record<LeaderboardPeriod, number> = {
  today: 50,
  week: 320,
  month: 1_400,
  all: 9_800,
};

const POINTS_CEIL_BY_PERIOD: Record<LeaderboardPeriod, number> = {
  today: 720,
  week: 5_180,
  month: 17_960,
  all: 124_500,
};

const generateEntries = (period: LeaderboardPeriod, count = 100): LeaderboardEntry[] => {
  faker.seed(period.charCodeAt(0) * 1009 + count);
  const ceil = POINTS_CEIL_BY_PERIOD[period];
  const floor = POINTS_FLOOR_BY_PERIOD[period];

  return Array.from({ length: count }).map((_, index) => {
    const ratio = index / Math.max(1, count - 1);
    const drift = faker.number.int({ min: -120, max: 120 });
    const points = Math.max(floor, Math.round(ceil * (1 - ratio) + floor * ratio) + drift);
    return {
      id: faker.string.uuid(),
      username: faker.internet.username().toLowerCase(),
      points,
      avatar: `https://i.pravatar.cc/200?img=${(index * 7 + period.length * 3) % 70}`,
      rankChange:
        index < 3 ? faker.number.int({ min: 0, max: 5 }) : faker.number.int({ min: -8, max: 8 }),
      place: index + 1,
      isVerified: faker.datatype.boolean({ probability: 0.35 }),
      isPrime: faker.datatype.boolean({ probability: 0.2 }),
      isVIP: faker.datatype.boolean({ probability: 0.25 }),
    } satisfies LeaderboardEntry;
  });
};

const buildResponse = (period: LeaderboardPeriod): LeaderboardResponse => {
  const places = generateEntries(period);
  const myRank = MY_RANK_BY_PERIOD[period];
  const myPlaceInList = places.find(entry => entry.place === myRank);

  const myPlace: LeaderboardEntry = {
    id: me.id,
    username: me.username,
    points: myPlaceInList?.points ?? POINTS_FLOOR_BY_PERIOD[period] + 80,
    avatar: me.avatar,
    rankChange: faker.number.int({ min: -5, max: 12 }),
    place: myRank,
    isVerified: me.isVerified,
    isPrime: me.isPrime,
    isVIP: me.isVIP,
  };

  if (myRank <= places.length) {
    places.splice(myRank - 1, 1, myPlace);
  }

  return {
    period,
    total: TOTAL_BY_PERIOD[period],
    places,
    myPlace,
  };
};

const responses: Record<LeaderboardPeriod, LeaderboardResponse> = {
  today: buildResponse('today'),
  week: buildResponse('week'),
  month: buildResponse('month'),
  all: buildResponse('all'),
};

export const leaderboardMock = {
  leaderboard: responses,
};
