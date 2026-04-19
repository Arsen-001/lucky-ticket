import { StakeStatus } from '@/types/enums/stakes.enums';
import type { StakeLevelDefinition, StakesData } from '@/types/interfaces/stakes.interfaces';

const stakeLevels: StakeLevelDefinition[] = [
  {
    level: 1,
    minDeposit: 100,
    guaranteedTicket: 'bronze',
    allTickets: ['bronze'],
    bonusPrizes: ['Additional LTC coins', 'Claim Speed Boost'],
  },
  {
    level: 2,
    minDeposit: 500,
    guaranteedTicket: 'silver',
    allTickets: ['bronze', 'silver'],
    bonusPrizes: ['Additional LTC coins', 'Claim Speed Boost', 'Claim Duration Boost'],
  },
  {
    level: 3,
    minDeposit: 1000,
    guaranteedTicket: 'gold',
    allTickets: ['bronze', 'silver', 'gold'],
    bonusPrizes: ['Additional LTC coins', 'Claim Speed Boost', 'Claim Duration Boost', 'Badge'],
  },
  {
    level: 4,
    minDeposit: 5000,
    guaranteedTicket: 'diamond',
    allTickets: ['bronze', 'silver', 'gold', 'diamond'],
    bonusPrizes: [
      'Large LTC coin bonus',
      'Claim Speed Boost',
      'Claim Duration Boost',
      'Exclusive Badge',
    ],
  },
];

const getActiveEndDate = () => {
  const date = new Date();
  date.setHours(date.getHours(), date.getMinutes() + 1);
  return date.toISOString();
};

const getActiveStartDate = () => {
  const date = new Date();
  date.setHours(date.getHours() - 1, date.getMinutes() - 30);
  return date.toISOString();
};

const stakesData: StakesData = {
  levels: stakeLevels,
  activeStake: {
    id: 'stake-001',
    level: 2,
    lockedAmount: 750,
    startDate: getActiveStartDate(),
    endDate: getActiveEndDate(),
    status: StakeStatus.ACTIVE,
    claimed: false,
  },
};

export const stakesMock = {
  stakes: stakesData,
  'POST stakes/start': { success: true },
  'POST stakes/cancel': { success: true },
  'POST stakes/claim': { success: true },
};
