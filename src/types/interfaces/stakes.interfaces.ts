import type { TicketType } from '@/types/types/ticket.types';
import type { StakeStatus } from '@/types/enums/stakes.enums';

export interface StakeLevelDefinition {
  level: number;
  minDeposit: number;
  guaranteedTicket: TicketType;
  allTickets: TicketType[];
  bonusPrizes: string[];
  starsChance: number;
  starsMin: number;
  starsMax: number;
}

export interface ActiveStake {
  id: string;
  level: number;
  lockedAmount: number;
  startDate: string;
  endDate: string;
  status: StakeStatus;
  claimed: boolean;
}

export interface StakeHistoryEntry {
  id: string;
  level: number;
  amount: number;
  ticketsCount: number;
  bonusLC: number;
  bonusStars: number;
  outcome: 'completed' | 'cancelled';
  completedAt: string;
}

export interface StakesData {
  levels: StakeLevelDefinition[];
  activeStakes: ActiveStake[];
  history: StakeHistoryEntry[];
}

export interface StartStakeBody {
  level: number;
  amount: number;
  durationMonths: number;
}

export interface StakeIdBody {
  stakeId: string;
}
