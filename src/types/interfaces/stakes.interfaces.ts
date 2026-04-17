import type { TicketType } from '@/types/types/ticket.types';
import type { StakeStatus } from '@/types/enums/stakes.enums';

export interface StakeLevelDefinition {
  level: number;
  minDeposit: number;
  guaranteedTicket: TicketType;
  allTickets: TicketType[];
  bonusPrizes: string[];
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

export interface StakesData {
  levels: StakeLevelDefinition[];
  activeStake: ActiveStake | null;
}

export interface StartStakeBody {
  level: number;
  amount: number;
}
