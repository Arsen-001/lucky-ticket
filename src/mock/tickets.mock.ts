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
    cycleSeconds: 18,
    perCycleOutput: 1,
    cycleStartedAt: getPastIso(7),
    pendingCount: 0,
    instantClaimStarsCost: 5,
    engineLevel: 1,
    speedLevel: 0,
    capacityLevel: 0,
  },
  {
    id: 'engine-bronze-2',
    cycleSeconds: 18,
    perCycleOutput: 1,
    cycleStartedAt: getPastIso(14),
    pendingCount: 0,
    instantClaimStarsCost: 5,
    engineLevel: 1,
    speedLevel: 2,
    capacityLevel: 4,
    speedBoostMultiplier: 2,
    speedBoostExpiresAt: getFutureIso(7200),
  },
  {
    id: 'engine-bronze-3',
    cycleSeconds: 18,
    perCycleOutput: 1,
    cycleStartedAt: getPastIso(18),
    pendingCount: 4,
    instantClaimStarsCost: 5,
    engineLevel: 2,
    speedLevel: 8,
    capacityLevel: 9,
  },
];

const silverEngines: TicketEngine[] = [
  {
    id: 'engine-silver-1',
    cycleSeconds: 28,
    perCycleOutput: 1,
    cycleStartedAt: getPastIso(28),
    pendingCount: 1,
    instantClaimStarsCost: 10,
    engineLevel: 1,
    speedLevel: 1,
    capacityLevel: 2,
  },
  {
    id: 'engine-silver-2',
    cycleSeconds: 28,
    perCycleOutput: 1,
    cycleStartedAt: getPastIso(11),
    pendingCount: 0,
    instantClaimStarsCost: 10,
    engineLevel: 1,
    speedLevel: 0,
    capacityLevel: 0,
    capacityUpgradeMultiplier: 2,
  },
];

const goldEngines: TicketEngine[] = [
  {
    id: 'engine-gold-1',
    cycleSeconds: 40,
    perCycleOutput: 1,
    cycleStartedAt: getPastIso(22),
    pendingCount: 0,
    instantClaimStarsCost: 15,
    engineLevel: 3,
    speedLevel: 5,
    capacityLevel: 3,
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
    count: 12,
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
    count: 4,
    engines: silverEngines,
  },
  {
    id: '123e4567-e89b-12d3-a456-426655440002',
    ticketType: 'gold',
    claimDate: getClaimDate(),
    autocollectFinishDate: getAutocollectFinishDate(),
    speed: 7,
    maxTime: {
      hours: 1,
      minutes: 45,
    },
    isTimeBoosted: false,
    isCollectionBoosted: false,
    blocked: false,
    count: 1,
    engines: goldEngines,
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
        requirementType: 'collect',
        type: 'gold',
        totalCount: 25,
        actualCount: 12,
      },
      {
        requirementType: 'invite',
        totalCount: 5,
        actualCount: 3,
      },
      {
        requirementType: 'join',
        type: 'gold',
        totalCount: 10,
        actualCount: 4,
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
        totalCount: 50,
        actualCount: 0,
      },
      {
        requirementType: 'task',
        totalCount: 3,
        actualCount: 1,
      },
      {
        requirementType: 'activity',
        totalCount: 14,
        actualCount: 5,
      },
    ],
  },
] as const;

export const ticketsMock = { tickets };
