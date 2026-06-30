import dayjs from 'dayjs';
import { appConfig } from '@/config/app.config';
import { getRandomUpcomingDate } from '@/utils/global/date.utils';
import type { Ticket, TicketType } from '@/types/types/ticket.types';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';

const getClaimDate = () => getRandomUpcomingDate(1, 180);
const getAutocollectFinishDate = () => getRandomUpcomingDate(2000, 3000);

const getPastIso = (offsetSeconds: number) =>
  dayjs().subtract(offsetSeconds, 'second').toISOString();

const getFutureIso = (offsetSeconds: number) => dayjs().add(offsetSeconds, 'second').toISOString();

interface EnginePreset {
  cycleSeconds: number;
  starsCost: number;
}

const { baseCycleSecondsByTier } = appConfig.engines;

const tierPresets: Record<TicketType, EnginePreset> = {
  bronze: { cycleSeconds: baseCycleSecondsByTier.bronze, starsCost: 5 },
  silver: { cycleSeconds: baseCycleSecondsByTier.silver, starsCost: 10 },
  gold: { cycleSeconds: baseCycleSecondsByTier.gold, starsCost: 15 },
  platinum: { cycleSeconds: baseCycleSecondsByTier.platinum, starsCost: 25 },
  diamond: { cycleSeconds: baseCycleSecondsByTier.diamond, starsCost: 40 },
};

const buildEngines = (tier: 'bronze' | 'silver' | 'gold', count: number): TicketEngine[] => {
  const preset = tierPresets[tier];
  return Array.from({ length: count }).map((_, index) => {
    const claimable = index % 3 === 0;
    const speedLevel = index % 10;
    const capacityLevel = (index * 2) % 10;
    const engineLevel = 1 + Math.floor(index / 5);
    return {
      id: `engine-${tier}-${index + 1}`,
      cycleSeconds: preset.cycleSeconds,
      perCycleOutput: 1,
      cycleStartedAt: getPastIso(claimable ? preset.cycleSeconds : index + 2),
      pendingCount: claimable ? 1 + (index % 3) : 0,
      instantClaimStarsCost: preset.starsCost,
      lifetimeProduced: engineLevel * 1900 + (speedLevel + capacityLevel) * 70 + index * 130,
      createdAt: getPastIso(86_400 * (20 + index * 5)),
      engineLevel,
      speedLevel,
      capacityLevel,
      ...(index % 4 === 1
        ? { speedBoostMultiplier: 2, speedBoostExpiresAt: getFutureIso(7200) }
        : {}),
      ...(index % 5 === 2 ? { capacityUpgradeMultiplier: 2 } : {}),
    } satisfies TicketEngine;
  });
};

const bronzeEngines: TicketEngine[] = buildEngines('bronze', 9);
const silverEngines: TicketEngine[] = buildEngines('silver', 7);
const goldEngines: TicketEngine[] = buildEngines('gold', 4);

const fresh = appConfig.account.fresh;

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

// Level-zero view: no owned tickets and no engines — the free Bronze starter is
// part of the welcome pack granted after the language step (`grantWelcomePack`), every
// locked-tier requirement reset to zero progress. Derived from `tickets` so the
// shape always matches the rich demo (which stays intact in the `else` branch).
const freshTickets: Ticket[] = tickets.map(ticket => ({
  ...ticket,
  count: 0,
  isTimeBoosted: false,
  isCollectionBoosted: false,
  engines: ticket.engines ? [] : ticket.engines,
  requirements: ticket.requirements?.map(requirement => ({ ...requirement, actualCount: 0 })),
}));

export const ticketsMock = { tickets: fresh ? freshTickets : tickets };
