import { faker } from '@faker-js/faker';
import { images } from '@/constants/images';
import { me } from '@/mock/me.mock';
import { otherProfile } from '@/mock/profile.mock';
import type {
  LeaderboardEntry,
  LeaderboardPeriod,
  LeaderboardResponse,
} from '@/types/interfaces/leaderboard.interfaces';
import { appConfig } from '@/config/app.config';

const fresh = appConfig.account.fresh;

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
  all: 1,
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
      avatar: LOCAL_AVATARS[(index * 7 + period.length * 3) % LOCAL_AVATARS.length],
      rankChange:
        index < 3 ? faker.number.int({ min: 0, max: 5 }) : faker.number.int({ min: -8, max: 8 }),
      place: index + 1,
      isVerified: faker.datatype.boolean({ probability: 0.35 }),
      isLuckyPlayer: faker.datatype.boolean({ probability: 0.2 }),
      isVIP: faker.datatype.boolean({ probability: 0.25 }),
      vipLevel: faker.number.int({ min: 1, max: 10 }),
      liked: faker.datatype.boolean({ probability: 0.15 }),
      likesReceived: faker.number.int({ min: 0, max: 4200 }),
    } satisfies LeaderboardEntry;
  });
};

const buildResponse = (period: LeaderboardPeriod): LeaderboardResponse => {
  const places = generateEntries(period);

  // Bind place #3 to a real mock profile (NebulaPilot / user-2) so the player
  // card's "View profile" opens an actual page instead of a 404.
  const bound = places[2];
  if (bound) {
    places[2] = {
      ...bound,
      id: otherProfile.id,
      username: otherProfile.username,
      displayName: otherProfile.displayName,
      avatar: otherProfile.avatar,
      liked: otherProfile.liked,
      likesReceived: otherProfile.publicStats.likesReceived,
    };
  }

  // Level-zero player sits unranked at the very bottom with no points — the
  // generated leaderboard (other players) is the world catalog and stays.
  const myRank = fresh ? TOTAL_BY_PERIOD[period] : MY_RANK_BY_PERIOD[period];
  const myPlaceInList = places.find(entry => entry.place === myRank);

  const myPlace: LeaderboardEntry = {
    id: me.id,
    username: me.username,
    displayName: me.displayName,
    points: fresh ? 0 : (myPlaceInList?.points ?? POINTS_FLOOR_BY_PERIOD[period] + 80),
    avatar: me.avatar,
    rankChange: fresh ? 0 : faker.number.int({ min: -5, max: 12 }),
    place: myRank,
    isVerified: me.isVerified,
    isLuckyPlayer: me.isLuckyPlayer,
    isVIP: me.isVIP,
    vipLevel: me.vipLevel,
    liked: false,
    likesReceived: fresh ? 0 : 234,
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
