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

/**
 * The engine as the SERVER saw it at the instant it answered — carried by every
 * claim path (`engines/claim`, `claim-all`, `complete-cycle`) and by the 400
 * that refuses a cycle still running. @see applyEngineSync
 */
export interface EngineSync {
  id: string;
  pendingCount: number;
  cycleStartedAt: string;
  /** Seconds left by the SERVER's clock and the SERVER's boost math. */
  secondsRemaining: number;
  ready: boolean;
  serverNow: string;
}

export interface TicketEngine {
  id: string;
  /**
   * The engine's own tier. Redundant with the ticket it is grouped under on most
   * screens, and carried here for the one rule that has to be decided from the
   * engine alone: the Test-Quest crown's permanent capacity applies to BRONZE
   * engines only (@see engineCapacity). Optional so an older payload — or a
   * fixture written before 17.08.2026 — simply misses the prize instead of
   * inventing tickets the server never mints.
   */
  tier?: TicketType;
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
  /**
   * Seconds the SERVER says this cycle still has to run (`GET /tickets`, and
   * every claim answer). Optional: mock fixtures and older payloads omit it.
   */
  secondsRemaining?: number;
  /**
   * The same verdict pinned to THIS device's clock — `Date.now() +
   * secondsRemaining` at the moment the payload arrived (@see serverReadyAt).
   *
   * The countdown has to be recomputed locally between requests, and until
   * 23.08.2026 that local answer was the only one: the client decided the cycle
   * was over, told the server (`complete-cycle`), was quietly ignored, drew
   * «Забрать» anyway, and the tap came back 400 — «Не удалось забрать награду»
   * on an engine that was simply still running. Whatever the two disagree about
   * — a device clock, a perk the client thinks is live, an inventory cache a
   * refetch behind — this is what the screens count down to instead.
   */
  readyAt?: string;
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
