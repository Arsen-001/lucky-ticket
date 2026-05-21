import type { TicketType } from '@/types/types/ticket.types';
import type { StakeStatus } from '@/types/enums/stakes.enums';

export interface StakeLevelDefinition {
  level: number;
  minDeposit: number;
  /** Tier identity of this stake level — drives accent colour and the AP-tier gate. */
  tier: TicketType;
  /** Bonus-draw: chance and LS range awarded on completion. */
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
  /** APR yield paid in LC on completion. */
  yieldLC: number;
  /** Lucky Stars awarded by the completion bonus draw (0 if the draw missed). */
  bonusLS: number;
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
