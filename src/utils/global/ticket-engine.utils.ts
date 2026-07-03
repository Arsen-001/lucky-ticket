import dayjs from 'dayjs';
import { GlobalConstants } from '@/constants/global.constants';
import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { Ticket, TicketType } from '@/types/types/ticket.types';

export const MAX_BOOST_LEVEL = 10;

/** LM-style additive speed boost contributed per engine level above 1 (%). */
export const ENGINE_LEVEL_SPEED_BOOST_PCT = 100;

/**
 * LM-style additive speed boost contributed per speed-level upgrade (%).
 * 10 levels × 10% = +100% at max — a fully speed-upgraded engine runs its
 * cycle twice as fast (DOCS §10.1).
 */
export const SPEED_LEVEL_BOOST_PCT_PER_LEVEL = 10;

/**
 * LM-style additive capacity boost contributed per capacity-level upgrade (%).
 * 10 levels × 10% = +100% at max — a fully capacity-upgraded engine mints 2
 * tickets per cycle instead of 1 (DOCS §10.2). The percent must be large
 * enough that `round(baseCapacity × (1 + boost))` actually moves for a
 * level-1 engine (base capacity 1) — at +1%/level the paid upgrade had zero
 * effect until chips pushed it over the rounding threshold.
 */
export const CAPACITY_LEVEL_BOOST_PCT_PER_LEVEL = 10;

/** Total speed-boost percent contributed by the engine level itself. */
export const engineLevelBoostPct = (engineLevel: number) =>
  Math.max(0, (engineLevel || 1) - 1) * ENGINE_LEVEL_SPEED_BOOST_PCT;

/** Total speed-boost percent contributed by the speed-level upgrade. */
export const speedLevelBoostPct = (level: number) =>
  Math.min(MAX_BOOST_LEVEL, Math.max(0, level)) * SPEED_LEVEL_BOOST_PCT_PER_LEVEL;

/** Total capacity-boost percent contributed by the capacity-level upgrade. */
export const capacityLevelBoostPct = (level: number) =>
  Math.min(MAX_BOOST_LEVEL, Math.max(0, level)) * CAPACITY_LEVEL_BOOST_PCT_PER_LEVEL;

/**
 * @deprecated Kept for legacy UI labels. Returns the equivalent cycle-time
 * multiplier (0..1) derived from the additive boost — i.e. `1 / (1 + boost%)`.
 */
export const speedMultiplier = (level: number) => 1 / (1 + speedLevelBoostPct(level) / 100);

export const baseCapacity = (engineLevel: number) =>
  1 + Math.max(0, (engineLevel || 1) - 1) * MAX_BOOST_LEVEL;

const isBoosterAlive = (booster: InventoryBooster) => {
  if (!booster.expiresAt) return true;
  return dayjs(booster.expiresAt).diff(dayjs()) > 0;
};

/**
 * Lords-Mobile-style additive boost stacking. All speed-boost sources sum
 * their percentages, and the final cycle is `base / (1 + totalBoost%)`.
 *
 * The hard 15-min-per-ticket floor (`GlobalConstants.engineMinSecondsPerTicket`)
 * still applies last — no matter how much boost stacks, a single ticket can
 * never be minted faster than that.
 */
export const effectiveCycleSeconds = (
  engine: TicketEngine,
  options?: {
    speedChip?: InventoryChip;
    speedBooster?: InventoryBooster;
    capacityChip?: InventoryChip;
    capacityBooster?: InventoryBooster;
    isLuckyPlayer?: boolean;
    isVip?: boolean;
    avatarBoostPct?: number;
  }
) => {
  // VIP supersedes LP — higher-tier engine speed boost wins, no stacking.
  const statusBoostPct = options?.isVip
    ? GlobalConstants.vipEngineSpeedBoostPct
    : options?.isLuckyPlayer
      ? GlobalConstants.luckyPlayerEngineSpeedBoostPct
      : 0;

  let totalBoostPct =
    engineLevelBoostPct(engine.engineLevel || 1) +
    speedLevelBoostPct(engine.speedLevel || 0) +
    statusBoostPct +
    (options?.avatarBoostPct ?? 0);

  if (options?.speedChip) totalBoostPct += options.speedChip.effectPct;
  if (options?.speedBooster && isBoosterAlive(options.speedBooster)) {
    totalBoostPct += options.speedBooster.effectPct;
  }

  const rawCycle = engine.cycleSeconds / (1 + totalBoostPct / 100);

  // Hard floor: per-ticket time cannot drop below the global cap, no matter
  // how many speed boosts stack. Cycle floor = capacity × cap.
  const capacity = engineCapacity(engine, {
    capacityChip: options?.capacityChip,
    capacityBooster: options?.capacityBooster,
  });
  const floor = capacity * GlobalConstants.engineMinSecondsPerTicket;
  return Math.max(rawCycle, floor);
};

/**
 * LM-style additive capacity boost — `baseCapacity × (1 + totalBoost%)`.
 * Every capacity-level upgrade contributes +1% to the additive stack, matching
 * how speed-level upgrades work on the speed side.
 */
export const engineCapacity = (
  engine: TicketEngine,
  options?: { capacityChip?: InventoryChip; capacityBooster?: InventoryBooster }
) => {
  let totalBoostPct = capacityLevelBoostPct(engine.capacityLevel || 0);
  if (options?.capacityChip) totalBoostPct += options.capacityChip.effectPct;
  if (options?.capacityBooster && isBoosterAlive(options.capacityBooster)) {
    totalBoostPct += options.capacityBooster.effectPct;
  }
  return Math.max(1, Math.round(baseCapacity(engine.engineLevel || 1) * (1 + totalBoostPct / 100)));
};

export const engineElapsedSeconds = (engine: TicketEngine) => {
  const started = dayjs(engine.cycleStartedAt);
  const now = dayjs();
  return Math.max(0, now.diff(started, 'second'));
};

export const isEngineMaxed = (engine: TicketEngine) =>
  (engine.speedLevel || 0) >= MAX_BOOST_LEVEL && (engine.capacityLevel || 0) >= MAX_BOOST_LEVEL;

export interface EngineLocation {
  engine: TicketEngine;
  tier: TicketType;
  ticketId: string;
  indexInTier: number;
}

export const findEngineLocation = (
  tickets: Ticket[] | undefined,
  engineId: string
): EngineLocation | null => {
  if (!tickets) return null;
  for (const ticket of tickets) {
    const indexInTier = ticket.engines?.findIndex(engine => engine.id === engineId) ?? -1;
    if (indexInTier >= 0 && ticket.engines) {
      return {
        engine: ticket.engines[indexInTier],
        tier: ticket.ticketType,
        ticketId: ticket.id,
        indexInTier,
      };
    }
  }
  return null;
};

/**
 * Duration/countdown as "H:MM:SS" above an hour, "MM:SS" below — base engine
 * cycles run 2h–32h, so a minutes-only format would read "1920:00" on diamond.
 */
export const formatCycleTime = (seconds: number) => {
  const total = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  const mmss = `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
  return hours > 0 ? `${hours}:${mmss}` : mmss;
};
