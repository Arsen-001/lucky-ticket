import { StakeStatus } from '@/types/enums/stakes.enums';
import type {
  StakeHistoryEntry,
  StakeLevelDefinition,
  StakesData,
} from '@/types/interfaces/stakes.interfaces';

const stakeLevels: StakeLevelDefinition[] = [
  {
    level: 1,
    minDeposit: 100,
    guaranteedTicket: 'bronze',
    allTickets: ['bronze'],
    bonusPrizes: ['LC bonus', 'Speed Boost'],
    starsChance: 5,
    starsMin: 5,
    starsMax: 15,
  },
  {
    level: 2,
    minDeposit: 500,
    guaranteedTicket: 'silver',
    allTickets: ['bronze', 'silver'],
    bonusPrizes: ['LC bonus', 'Speed Boost', 'Capacity Upgrade'],
    starsChance: 10,
    starsMin: 15,
    starsMax: 40,
  },
  {
    level: 3,
    minDeposit: 1000,
    guaranteedTicket: 'gold',
    allTickets: ['bronze', 'silver', 'gold'],
    bonusPrizes: ['LC bonus', 'Speed Boost', 'Capacity Upgrade', 'Badge'],
    starsChance: 20,
    starsMin: 40,
    starsMax: 100,
  },
  {
    level: 4,
    minDeposit: 2500,
    guaranteedTicket: 'platinum',
    allTickets: ['bronze', 'silver', 'gold', 'platinum'],
    bonusPrizes: ['LC bonus', 'Speed Boost', 'Capacity Upgrade', 'Premium Badge'],
    starsChance: 30,
    starsMin: 70,
    starsMax: 250,
  },
  {
    level: 5,
    minDeposit: 5000,
    guaranteedTicket: 'diamond',
    allTickets: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    bonusPrizes: ['Large LC bonus', 'Boosts & Upgrades', 'Exclusive Badge'],
    starsChance: 40,
    starsMin: 100,
    starsMax: 500,
  },
];

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
const minutesFromNow = (m: number) => new Date(Date.now() + m * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

const history: StakeHistoryEntry[] = [
  {
    id: 'h1',
    level: 5,
    amount: 5000,
    ticketsCount: 5,
    bonusLC: 320,
    bonusStars: 120,
    outcome: 'completed',
    completedAt: hoursAgo(26),
  },
  {
    id: 'h2',
    level: 2,
    amount: 500,
    ticketsCount: 2,
    bonusLC: 30,
    bonusStars: 0,
    outcome: 'completed',
    completedAt: hoursAgo(49),
  },
  {
    id: 'h3',
    level: 1,
    amount: 100,
    ticketsCount: 0,
    bonusLC: 0,
    bonusStars: 0,
    outcome: 'cancelled',
    completedAt: hoursAgo(73),
  },
];

const stakesData: StakesData = {
  levels: stakeLevels,
  activeStakes: [
    {
      id: 'stake-mid',
      level: 2,
      lockedAmount: 500,
      startDate: minutesAgo(65),
      endDate: minutesFromNow(115),
      status: StakeStatus.ACTIVE,
      claimed: false,
    },
    {
      id: 'stake-ready',
      level: 3,
      lockedAmount: 1500,
      startDate: hoursAgo(4),
      endDate: minutesAgo(60),
      status: StakeStatus.COMPLETED,
      claimed: false,
    },
  ],
  history,
};

export const stakesMock = {
  stakes: stakesData,
  'POST stakes/start': { success: true },
  'POST stakes/cancel': { success: true },
  'POST stakes/claim': { success: true },
};
