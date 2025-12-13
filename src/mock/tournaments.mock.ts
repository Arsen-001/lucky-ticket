import type { Tournament } from '@/types/interfaces/tournaments.interfaces';
import dayjs from 'dayjs';
import { getRandomNumber } from '@/utils/number.utils';

export const tournaments: Tournament[] = [
  {
    id: '123e4567-e89b-12d3-a456-426655440000',
    name: 'Golden Tournament',
    startTime: dayjs().add(getRandomNumber(60, 10000), 'second').toISOString(),
    teamSize: getRandomNumber(1, 1000),
    prizePool: getRandomNumber(1, 1000),
    type: 'gold',
    guaranteedPool: getRandomNumber(1, 1000),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440001',
    name: 'Silver Tournament',
    startTime: dayjs().add(getRandomNumber(60, 10000), 'second').toISOString(),
    teamSize: getRandomNumber(1, 1000),
    prizePool: getRandomNumber(1, 1000),
    type: 'silver',
    guaranteedPool: getRandomNumber(1, 1000),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440002',
    name: 'Bronze Tournament',
    startTime: dayjs().add(getRandomNumber(60, 10000), 'second').toISOString(),
    teamSize: getRandomNumber(1, 1000),
    prizePool: getRandomNumber(1, 1000),
    type: 'bronze',
    guaranteedPool: getRandomNumber(1, 1000),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440003',
    name: 'Everyday Tournament',
    startTime: dayjs().add(getRandomNumber(60, 10000), 'second').toISOString(),
    teamSize: getRandomNumber(1, 1000),
    prizePool: getRandomNumber(1, 1000),
    type: 'bronze',
    guaranteedPool: getRandomNumber(1, 1000),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440004',
    name: 'Platinum Tournament',
    startTime: dayjs().add(getRandomNumber(60, 10000), 'second').toISOString(),
    teamSize: getRandomNumber(1, 1000),
    prizePool: getRandomNumber(1, 1000),
    type: 'platinum',
    guaranteedPool: getRandomNumber(1, 1000),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440005',
    name: 'Diamond Tournament',
    startTime: dayjs().add(getRandomNumber(60, 10000), 'second').toISOString(),
    teamSize: getRandomNumber(1, 1000),
    prizePool: getRandomNumber(1, 1000),
    type: 'diamond',
    guaranteedPool: getRandomNumber(1, 1000),
  },
];

export const tournamentsMock = { tournaments };
