import { getRandomUpcomingDate } from '@/utils/global/date.utils';
import type { Ticket } from '@/types/types/ticket.types';

const getClaimDate = () => getRandomUpcomingDate(1, 180);
const getAutocollectFinishDate = () => getRandomUpcomingDate(2000, 3000);

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
    isTimeBoosted: true,
    isCollectionBoosted: false,
    blocked: false,
    count: 10,
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
    isTimeBoosted: true,
    isCollectionBoosted: true,
    blocked: false,
    count: 5,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440002',
    ticketType: 'gold',
    blocked: true,
    count: 0,
    speed: 7,
    maxTime: {
      hours: 1,
      minutes: 45,
    },
    requirements: [
      {
        requirementType: 'collect',
        type: 'silver',
        totalCount: 50,
        actualCount: 25,
      },
      {
        requirementType: 'invite',
        totalCount: 5,
        actualCount: 2,
      },
    ],
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440003',
    ticketType: 'platinum',
    blocked: true,
    count: 0,
    speed: 10,
    maxTime: {
      hours: 2,
      minutes: 0,
    },
    requirements: [
      {
        requirementType: 'join',
        type: 'gold',
        totalCount: 10,
        actualCount: 0,
      },
      {
        requirementType: 'activity',
        totalCount: 7,
        actualCount: 3,
      },
      {
        requirementType: 'task',
        totalCount: 5,
        actualCount: 1,
      },
      {
        requirementType: 'collect',
        type: 'silver',
        totalCount: 100,
        actualCount: 45,
      },
    ],
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440004',
    ticketType: 'diamond',
    blocked: true,
    count: 0,
    speed: 20,
    maxTime: {
      hours: 4,
      minutes: 0,
    },
    requirements: [
      {
        requirementType: 'collect',
        type: 'platinum',
        totalCount: 100,
        actualCount: 10,
      },
    ],
  },
] as const;

export const ticketsMock = { tickets };
