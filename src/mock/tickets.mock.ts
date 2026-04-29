import dayjs from 'dayjs';
import { getRandomUpcomingDate } from '@/utils/global/date.utils';
import type { Ticket } from '@/types/types/ticket.types';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';

const getClaimDate = () => getRandomUpcomingDate(1, 180);
const getAutocollectFinishDate = () => getRandomUpcomingDate(2000, 3000);

const getPastIso = (offsetSeconds: number) =>
  dayjs().subtract(offsetSeconds, 'second').toISOString();

const getFutureIso = (offsetSeconds: number) => dayjs().add(offsetSeconds, 'second').toISOString();

const bronzeEngines: TicketEngine[] = [
  {
    id: 'engine-bronze-1',
    cycleSeconds: 3600,
    perCycleOutput: 1,
    cycleStartedAt: getPastIso(900),
    pendingCount: 2,
    speedBoostMultiplier: 2,
    speedBoostExpiresAt: getFutureIso(7200),
    instantClaimStarsCost: 5,
  },
];

const silverEngines: TicketEngine[] = [
  {
    id: 'engine-silver-1',
    cycleSeconds: 7200,
    perCycleOutput: 1,
    cycleStartedAt: getPastIso(1800),
    pendingCount: 1,
    instantClaimStarsCost: 10,
  },
  {
    id: 'engine-silver-2',
    cycleSeconds: 7200,
    perCycleOutput: 2,
    cycleStartedAt: getPastIso(3000),
    pendingCount: 0,
    capacityUpgradeMultiplier: 2,
    instantClaimStarsCost: 10,
  },
];

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
    engines: bronzeEngines,
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
    engines: silverEngines,
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
