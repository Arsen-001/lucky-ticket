import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import { effectiveEngineSpeedMultiplierPct, effectiveStatusPct } from '@/utils/global/status.utils';
import {
  type EngineLevelTables,
  baseCapacity,
  capacityLevelBonusTickets,
  engineLevelBoostPct,
  fullLevelBonusTickets,
  fullLevelSpeedBonusPct,
  speedLevelBoostPct,
} from '@/utils/global/ticket-engine.utils';
import { chipCapacityTickets, chipSpeedFactor } from '@/utils/global/inventory.utils';

/**
 * Every contributor to an engine's speed stack — the same seven terms
 * `effectiveCycleSeconds` applies, in the order the UI lists them. Six are
 * additive; the chip is a multiplier and is reported as its additive
 * equivalent so the sum still equals what the countdown runs on.
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
  perks?: Pick<StatusPerks, 'engineSpeedBoostPct' | 'engineSpeedMultiplierPct'>;
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
): EngineSpeedBoostSource[] => {
  const additive: EngineSpeedBoostSource[] = [
    // The finished-level speed bonus is a level reward, so it rides the level's
    // own row: a 10/10 engine shows it here, a freshly promoted one shows the
    // same number absorbed into the next level's base.
    {
      key: 'engineLevel',
      pct:
        engineLevelBoostPct(engine.engineLevel || 1, options.tables) +
        fullLevelSpeedBonusPct(engine, options.tables),
    },
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
    { key: 'booster', pct: options.speedBooster?.effectPct ?? 0, temporary: true },
    { key: 'avatar', pct: options.avatarBoostPct ?? 0 },
    { key: 'badge', pct: options.badgeBoostPct ?? 0 },
  ];
  // Two MULTIPLIERS sit on top of that sum — the speed chip and the Lucky
  // Player perk (@see chipSpeedFactor, effectiveEngineSpeedMultiplierPct). The
  // reactor face draws additive arcs and prints `baseline ÷ (1 + total) =
  // cycle`, so each multiplier is shown as the additive amount it is WORTH
  // here. Chip: (1 + others) × (chipF − 1). LP: (1 + others) × chipF × (lpF − 1).
  // Together they add up to exactly (1 + others) × chipF × lpF − 1, so the
  // equation still resolves to the countdown next to it. On a fresh engine each
  // reads as its own percentage; on a maxed one the same ×2 chip reads as
  // +850 % — which is exactly what it does to that engine.
  const others = additive.reduce((sum, source) => sum + source.pct, 0);
  const chipFactor = chipSpeedFactor(options.speedChip?.level);
  const lpFactor =
    1 + effectiveEngineSpeedMultiplierPct(options.isLuckyPlayer ?? false, options.perks) / 100;
  const chipEquivalentPct = (1 + others / 100) * (chipFactor - 1) * 100;
  const lpEquivalentPct = (1 + others / 100) * chipFactor * (lpFactor - 1) * 100;
  const chip: EngineSpeedBoostSource = { key: 'chip', pct: chipEquivalentPct };
  // The LP multiplier rides the status row, next to VIP's summand.
  const status: EngineSpeedBoostSource = { key: 'status', pct: additive[2].pct + lpEquivalentPct };
  // Keep the UI's row order: level, taps, status, chip, booster, avatar, badge.
  return [additive[0], additive[1], status, chip, additive[3], additive[4], additive[5]];
};

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
    // Same treatment for the finished-level ticket bonus.
    {
      key: 'engineLevel',
      tickets: levelBase - factory + fullLevelBonusTickets(engine, options.tables),
      pct: 0,
    },
    {
      key: 'capacityLevel',
      tickets: capacityLevelBonusTickets(engine.capacityLevel || 0, options.tables),
      pct: 0,
    },
    // The capacity chip adds whole tickets now (@see chipCapacityTickets).
    { key: 'chip', tickets: chipCapacityTickets(options.capacityChip?.level), pct: 0 },
    { key: 'booster', tickets: 0, pct: options.capacityBooster?.effectPct ?? 0 },
  ];
};

/** Only the rungs that actually contribute — what the UI renders. */
export const activeCapacitySources = (sources: readonly EngineCapacitySource[]) =>
  sources.filter(source => source.tickets > 0 || source.pct > 0);

/** Only the contributors actually granting something — what the UI renders. */
export const activeSpeedBoostSources = (sources: readonly EngineSpeedBoostSource[]) =>
  sources.filter(source => source.pct > 0);
