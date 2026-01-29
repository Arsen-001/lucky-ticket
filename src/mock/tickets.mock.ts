import { getRandomUpcomingDate } from '@/utils/global/date.utils';
import { getRandomNumber } from '@/utils/global/number.utils';
import type { Ticket } from '@/types/types/ticket.types';

const getClaimDate = () => getRandomUpcomingDate(1, 180);
const getAutocollectFinishDate = () => getRandomUpcomingDate(2000, 3000);
const getCounts = () => {
  const totalCount = getRandomNumber(1, 100);
  const actualCount = getRandomNumber(0, totalCount);
  return { totalCount, actualCount };
};

const tickets: Ticket[] = [
  {
    id: '123e4567-e89b-12d3-a456-426655440000',
    ticketType: 'bronze',
    claimDate: getClaimDate(),
    autocollectFinishDate: getAutocollectFinishDate(),
    speed: 2,
    maxTime: {
      hours: 1,
      minutes: 10,
    },
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440001',
    ticketType: 'silver',
    claimDate: getClaimDate(),
    autocollectFinishDate: getAutocollectFinishDate(),
    speed: 5,
    maxTime: {
      hours: 1,
      minutes: 20,
    },
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440002',
    ticketType: 'gold',
    requirements: [
      {
        requirementType: 'collect',
        type: 'bronze',
        ...getCounts(),
      },
      {
        requirementType: 'join',
        type: 'bronze',
        ...getCounts(),
      },
      {
        requirementType: 'invite',
        ...getCounts(),
      },
    ],
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440003',
    ticketType: 'platinum',
    requirements: [
      {
        requirementType: 'collect',
        type: 'silver',
        ...getCounts(),
      },
      {
        requirementType: 'join',
        type: 'gold',
        ...getCounts(),
      },
      {
        requirementType: 'invite',
        ...getCounts(),
      },
    ],
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440004',
    ticketType: 'diamond',
    requirements: [
      {
        requirementType: 'collect',
        type: 'gold',
        ...getCounts(),
      },
      {
        requirementType: 'join',
        type: 'platinum',
        ...getCounts(),
      },
      {
        requirementType: 'invite',
        ...getCounts(),
      },
    ],
  },
] as const;

export const ticketsMock = { tickets };
