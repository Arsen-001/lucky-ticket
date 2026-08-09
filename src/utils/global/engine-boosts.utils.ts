import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import { effectiveStatusPct } from '@/utils/global/status.utils';
import {
  type EngineLevelTables,
  baseCapacity,
  capacityLevelBonusTickets,
  engineLevelBoostPct,
  speedLevelBoostPct,
} from '@/utils/global/ticket-engine.utils';

/**
 * Every additive contributor to an engine's speed stack — the same seven terms
 * `effectiveCycleSeconds` sums, in the order the UI lists them.
 */
export type EngineSpeedBoostKey =
  | 'engineLevel'
  | 'speedLevel'
  | 'status'
  | 'chip'
  | 'booster'
  | 'avatar'
  | 'badge';

export interface EngineSpeedBoostSource {
  key: EngineSpeedBoostKey;
  pct: number;
  /** Time-limited (booster) — the UI separates it from permanent boosts. */
  temporary?: boolean;
}

export interface EngineSpeedBoostOptions {
  speedChip?: InventoryChip;
  /** Must already be filtered for liveness (`findActiveBooster` does it). */
  speedBooster?: InventoryBooster;
  isLuckyPlayer?: boolean;
  isVip?: boolean;
  perks?: Pick<StatusPerks, 'engineSpeedBoostPct'>;
  avatarBoostPct?: number;
  badgeBoostPct?: number;
  tables?: EngineLevelTables;
}

/**
 * Breaks the speed stack into its named parts, so the screen can answer
 * "why is this engine this fast?" instead of only quoting the result.
 *
 * ⚠️ This MUST mirror `effectiveCycleSeconds` term for term — it is the same
 * sum, only itemised. A term added there and missed here shows a total that
 * disagrees with the countdown the player is watching.
 */
export const engineSpeedBoostSources = (
  engine: TicketEngine,
  options: EngineSpeedBoostOptions = {}
): EngineSpeedBoostSource[] => [
  { key: 'engineLevel', pct: engineLevelBoostPct(engine.engineLevel || 1, options.tables) },
  { key: 'speedLevel', pct: speedLevelBoostPct(engine.speedLevel || 0, options.tables) },
  {
    key: 'status',
    pct: effectiveStatusPct(
      'engineSpeedBoostPct',
      options.isLuckyPlayer ?? false,
      options.isVip ?? false,
      options.perks
    ),
  },
  { key: 'chip', pct: options.speedChip?.effectPct ?? 0 },
  { key: 'booster', pct: options.speedBooster?.effectPct ?? 0, temporary: true },
  { key: 'avatar', pct: options.avatarBoostPct ?? 0 },
  { key: 'badge', pct: options.badgeBoostPct ?? 0 },
];

export const totalSpeedBoostPct = (sources: readonly EngineSpeedBoostSource[]) =>
  sources.reduce((sum, source) => sum + source.pct, 0);

/**
 * The capacity ladder, itemised the way `engineCapacity` builds it: absolute
 * tickets first (factory batch + engine level + capacity sub-level), then the
 * percentage scalers (chip, booster) applied to that whole batch.
 */
export type EngineCapacityKey = 'factory' | 'engineLevel' | 'capacityLevel' | 'chip' | 'booster';

export interface EngineCapacitySource {
  key: EngineCapacityKey;
  /** Absolute tickets this source adds (`factory` carries the starting batch). */
  tickets: number;
  /** Percentage this source scales the batch by — chips and boosters only. */
  pct: number;
}

export interface EngineCapacityOptions {
  capacityChip?: InventoryChip;
  /** Must already be filtered for liveness (`findActiveBooster` does it). */
  capacityBooster?: InventoryBooster;
  tables?: EngineLevelTables;
}

export const engineCapacitySources = (
  engine: TicketEngine,
  options: EngineCapacityOptions = {}
): EngineCapacitySource[] => {
  const levelBase = baseCapacity(engine.engineLevel || 1, options.tables);
  const factory = baseCapacity(1, options.tables);
  return [
    { key: 'factory', tickets: factory, pct: 0 },
    { key: 'engineLevel', tickets: levelBase - factory, pct: 0 },
    {
      key: 'capacityLevel',
      tickets: capacityLevelBonusTickets(engine.capacityLevel || 0, options.tables),
      pct: 0,
    },
    { key: 'chip', tickets: 0, pct: options.capacityChip?.effectPct ?? 0 },
    { key: 'booster', tickets: 0, pct: options.capacityBooster?.effectPct ?? 0 },
  ];
};

/** Only the rungs that actually contribute — what the UI renders. */
export const activeCapacitySources = (sources: readonly EngineCapacitySource[]) =>
  sources.filter(source => source.tickets > 0 || source.pct > 0);

/** Only the contributors actually granting something — what the UI renders. */
export const activeSpeedBoostSources = (sources: readonly EngineSpeedBoostSource[]) =>
  sources.filter(source => source.pct > 0);
