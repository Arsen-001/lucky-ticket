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
 * Every contributor to an engine's speed stack — the same eight terms
 * `effectiveCycleSeconds` applies, in the order the UI lists them: the six that
 * ADD up first, then the two that MULTIPLY the result (the speed chip and Lucky
 * Player). Multipliers are additionally reported as their additive equivalent,
 * so the sum still equals what the countdown runs on.
 *
 * The two classes are named apart because they behave apart, and a player who
 * cannot tell them apart mis-buys: a +30 % row and a ×1.3 row look
 * interchangeable, but on a maxed engine (+750 %) the first is worth ×1.04 and
 * the second still ×1.3. @see EngineStatsLedger, which groups them under
 * separate headings for exactly this reason.
 */
export type EngineSpeedBoostKey =
  | 'engineLevel'
  | 'speedLevel'
  | 'vip'
  | 'booster'
  | 'avatar'
  | 'badge'
  | 'chip'
  | 'luckyPlayer';

export interface EngineSpeedBoostSource {
  key: EngineSpeedBoostKey;
  pct: number;
  /** Time-limited (booster) — the UI separates it from permanent boosts. */
  temporary?: boolean;
  /**
   * Set on MULTIPLIER sources only, carrying the raw factor (`1.3` = ×1.3).
   * Its presence is what marks a source as a super boost; `pct` stays the
   * additive equivalent on this engine so bars, arcs and totals keep summing.
   */
  multiplier?: number;
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
    // VIP only: Lucky Player left the additive stack on 17.08.2026 and is a
    // multiplier below. `effectiveStatusPct` returns 0 for an LP-only player.
    {
      key: 'vip',
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
  // cycle`, so each multiplier ALSO carries the additive amount it is WORTH
  // here. Chip: (1 + others) × (chipF − 1). LP: (1 + others) × chipF × (lpF − 1).
  // Together they add up to exactly (1 + others) × chipF × lpF − 1, so the
  // equation still resolves to the countdown next to it. On a fresh engine each
  // reads as its own percentage; on a maxed one the same ×2 chip reads as
  // +850 % — which is exactly what it does to that engine.
  const others = additive.reduce((sum, source) => sum + source.pct, 0);
  const chipFactor = chipSpeedFactor(options.speedChip?.level);
  const lpFactor =
    1 + effectiveEngineSpeedMultiplierPct(options.isLuckyPlayer ?? false, options.perks) / 100;
  const chip: EngineSpeedBoostSource = {
    key: 'chip',
    pct: (1 + others / 100) * (chipFactor - 1) * 100,
    multiplier: chipFactor,
  };
  const luckyPlayer: EngineSpeedBoostSource = {
    key: 'luckyPlayer',
    pct: (1 + others / 100) * chipFactor * (lpFactor - 1) * 100,
    multiplier: lpFactor,
  };
  // Additive block first, multiplier block last — the order IS the explanation,
  // and it is what the reactor's outermost arcs and the ledger's second group
  // both rely on.
  return [...additive, chip, luckyPlayer];
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

/**
 * A super boost — one that MULTIPLIES the whole stack instead of adding to it
 * (speed chip, Lucky Player). The single predicate every screen asks, so none
 * of them has to know which keys those are.
 */
export const isSuperBoost = (source: EngineSpeedBoostSource): boolean =>
  source.multiplier !== undefined && source.multiplier > 1;

/**
 * The additive half of the stack — everything that is summed, in row order.
 * Keyed off the ABSENCE of a factor, not off `isSuperBoost`: an unequipped chip
 * carries ×1 and belongs to neither half (`activeSpeedBoostSources` drops it).
 */
export const additiveSpeedBoostSources = (sources: readonly EngineSpeedBoostSource[]) =>
  sources.filter(source => source.multiplier === undefined);

/** The multiplier half — what the UI presents as "super boosts". */
export const superSpeedBoostSources = (sources: readonly EngineSpeedBoostSource[]) =>
  sources.filter(isSuperBoost);
