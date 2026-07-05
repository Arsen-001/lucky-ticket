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
  cycleStartedAt: string;
  pendingCount: number;
  /** Total tickets this engine has ever claimed (running backend counter). */
  lifetimeProduced?: number;
  /** When the engine was first acquired (stable; unlike cycleStartedAt). */
  createdAt?: string;
  // Production math is fully additive: per-cycle output derives from
  // engineLevel + capacityLevel + chips (see ticket-engine.utils), and cycle
  // speed from engineLevel + speedLevel + chips/boosters/status/avatar. There
  // are deliberately NO multiplier/expiry fields on the engine — a backend
  // implementer must not resurrect the old multiplicative model (audit L1).
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
