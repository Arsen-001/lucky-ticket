import type { TicketRequirementType, TicketType } from '@/types/types/ticket.types';
import type { TournamentType } from '@/types/types/tournaments.types';
import type { Duration } from '@/types/interfaces/date.interfaces';

export interface BaseTicketProps {
  id: string;
  ticketType: TicketType;
  count?: number;
}

export interface TicketRequirement {
  requirementType: TicketRequirementType;
  type?: TicketType | TournamentType;
  totalCount: number;
  actualCount: number;
  title?: string;
}

export interface BlockedTicketProps extends BaseTicketProps {
  blocked: boolean;
  requirements?: TicketRequirement[];
}

export interface TicketEngine {
  id: string;
  cycleSeconds: number;
  perCycleOutput: number;
  cycleStartedAt: string;
  pendingCount: number;
  speedBoostMultiplier?: number;
  speedBoostExpiresAt?: string;
  capacityUpgradeMultiplier?: number;
  instantClaimStarsCost: number;
  /** Total tickets this engine has ever claimed (running backend counter). */
  lifetimeProduced?: number;
  engineLevel?: number;
  speedLevel?: number;
  capacityLevel?: number;
}

export interface AvailableTicketItemProps extends BaseTicketProps {
  claimDate: string;
  autocollectFinishDate: string;
  maxTime: Duration;
  speed: number;
  isTimeBoosted: boolean;
  isCollectionBoosted: boolean;
  engines?: TicketEngine[];
}
