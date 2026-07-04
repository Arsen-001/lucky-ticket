import { faker } from '@faker-js/faker';
import { images } from '@/constants/images';
import { appConfig } from '@/config/app.config';
import type { ActivityTier } from '@/constants/global.constants';
import type { JackpotState, JackpotWinner } from '@/types/interfaces/jackpot.interfaces';

const fresh = appConfig.account.fresh;

const AVATARS = [
  images.avatar1.src,
  images.avatar2.src,
  images.avatar3.src,
  images.avatar4.src,
  images.avatar5.src,
  images.avatar6.src,
  images.avatarYerevan.src,
  images.avatar.src,
];

/**
 * The pot is a single GLOBAL platform value — it exists (and looks big) even
 * for a brand-new level-zero account, exactly like the leaderboard world
 * catalog. Only the player-specific `myActiveTournamentsCount` is zeroed when
 * `fresh`. `buildJackpotState` is a handler so the pot grows a little across
 * refetches, which the live odometer reconciles to.
 */
const ACCRUAL_PER_SECOND = 92;
const BASE_POT = 481_264;
const RECORD_POT = 924_018;
// Lifetime sum of every jackpot ever paid out — a historical figure that only
// moves when a jackpot detonates, so unlike `pot` it is NOT animated live.
const ALL_TIME_PAID_OUT = 14_248_000;
const startedAt = Date.now();

const buildJackpotState = (): JackpotState => {
  const elapsedSeconds = (Date.now() - startedAt) / 1000;
  return {
    pot: Math.round(BASE_POT + elapsedSeconds * ACCRUAL_PER_SECOND),
    record: RECORD_POT,
    allTimePaidOut: ALL_TIME_PAID_OUT,
    accrualPerSecond: ACCRUAL_PER_SECOND,
    myActiveTournamentsCount: fresh ? 0 : 3,
  };
};

const TIER_CYCLE: ActivityTier[] = [
  'diamond',
  'gold',
  'platinum',
  'silver',
  'gold',
  'bronze',
  'diamond',
  'silver',
];
const TIME_OF_DAY = ['Night', 'Evening', 'Afternoon', 'Morning'];
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const buildWinners = (): JackpotWinner[] => {
  faker.seed(7705);
  return Array.from({ length: 8 }).map((_, index) => {
    const tier = TIER_CYCLE[index % TIER_CYCLE.length];
    const hoursAgo = index * 9 + faker.number.int({ min: 1, max: 6 });
    return {
      id: faker.string.uuid(),
      potTotal: faker.number.int({ min: 1_300, max: 8_900 }) * 100,
      tier,
      tournamentName: `${TIME_OF_DAY[index % TIME_OF_DAY.length]} ${titleCase(tier)}`,
      wonAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      topWinnerName: faker.internet.username().toLowerCase(),
      topWinnerAvatar: AVATARS[index % AVATARS.length],
    } satisfies JackpotWinner;
  });
};

export const jackpotMock = {
  jackpot: buildJackpotState,
  'jackpot/winners': buildWinners(),
};
