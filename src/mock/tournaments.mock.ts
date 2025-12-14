import type { Tournament } from '@/types/interfaces/tournaments.interfaces';
import { getRandomNumber } from '@/utils/number.utils';
import { getRandomUpcomingDate } from '@/utils/date.utils';

const getNum = () => getRandomNumber(1, 1000);
const getStartTime = () => getRandomUpcomingDate(60, 10000);

export const tournaments: Tournament[] = [
  {
    id: '123e4567-e89b-12d3-a456-426655440000',
    name: 'Golden Tournament',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'gold',
    guaranteedPool: getNum(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440001',
    name: 'Silver Tournament',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'silver',
    guaranteedPool: getNum(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440002',
    name: 'Bronze Tournament',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'bronze',
    guaranteedPool: getNum(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440003',
    name: 'Everyday Tournament',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'bronze',
    guaranteedPool: getNum(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440004',
    name: 'Platinum Tournament',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'platinum',
    guaranteedPool: getNum(),
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440005',
    name: 'Diamond Tournament',
    startTime: getStartTime(),
    teamSize: getNum(),
    prizePool: getNum(),
    type: 'diamond',
    guaranteedPool: getNum(),
  },
];

export const tournamentsMock = { tournaments };
