import dayjs from 'dayjs';
import { GlobalConstants } from '@/constants/global.constants';
import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { Ticket, TicketType } from '@/types/types/ticket.types';

/* ────────────────────────────────────────────────────────────────────────────
 *  ⚙️  ENGINE LEVEL TABLES — «сколько даёт каждый уровень» (скорость / объём)
 *
 *  ЕДИНСТВЕННЫЙ источник правды для того, что даёт каждый уровень куба.
 *  Правь ЯЧЕЙКИ этих четырёх таблиц — всё остальное (UI кубов, апгрейды,
 *  промоушен, потолки, экономический guardrail-тест, бэкенд-зеркало) считает
 *  отсюда. Кривая может быть любой — не обязана быть линейной.
 *
 *  Значения ниже = текущая линейная кривая, поведение 1-в-1 как раньше. Меняй
 *  числа под нужный баланс; длину таблиц (число уровней) тоже можно менять —
 *  потолки `MAX_BOOST_LEVEL` / `MAX_ENGINE_LEVEL` выводятся из длины.
 *
 *  ⚠️  Бэкенд должен зеркалить те же таблицы (audit L1) — синхронь после правок.
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Speed-boost **%** contributed by the engine's SPEED sub-level.
 * Index = `speedLevel` (0 = no upgrade). Table length ⇒ `MAX_BOOST_LEVEL`.
 * Default: linear +10 % / level → 0…100 %.
 */
export const SPEED_LEVEL_BOOST_PCT_TABLE: readonly number[] = [
  //  lvl0  lvl1  lvl2  lvl3  lvl4  lvl5  lvl6  lvl7  lvl8  lvl9  lvl10
  0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
];

/**
 * **Absolute** per-cycle ticket bonus contributed by the engine's CAPACITY
 * sub-level — every paid tap simply adds tickets (default **+1 per level**),
 * the same +1 at every engine level. Index = `capacityLevel` (0 = no upgrade).
 * Keep the SAME length as the speed table — both sub-ladders share the
 * `0…MAX_BOOST_LEVEL` range. (Chips/boosters stay percentage-based and apply
 * on top of `base + bonus` — see `engineCapacity`.)
 */
export const CAPACITY_LEVEL_BONUS_TICKETS_TABLE: readonly number[] = [
  //  lvl0  lvl1  lvl2  lvl3  lvl4  lvl5  lvl6  lvl7  lvl8  lvl9  lvl10
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
];

/**
 * Speed-boost **%** contributed by the engine LEVEL itself (reached by
 * promotion — §10.2). Indexed by `engineLevel` DIRECTLY (1…`MAX_ENGINE_LEVEL`);
 * index 0 mirrors level 1 so an absent/falsy level reads as level 1.
 * Default: +100 % / level above 1 → 0 / 100 / 200 / 300 / 400.
 */
export const ENGINE_LEVEL_SPEED_BOOST_PCT_TABLE: readonly number[] = [
  //  (lvl0) lvl1  lvl2  lvl3  lvl4  lvl5
  0, 0, 100, 200, 300, 400,
];

/**
 * BASE per-cycle output — **absolute** ticket count before any % capacity boost —
 * at each engine LEVEL. Indexed by `engineLevel` DIRECTLY (1…`MAX_ENGINE_LEVEL`);
 * index 0 mirrors level 1. Default: 1 → 22 → 43 → 64 → 86, tuned so a FULL-maxed
 * engine (level 5, both ladders 10/10 → batch 86 + 10 = 96) hits the 900 s/ticket
 * floor at exactly 96 × 900 s = 24 h — one big batch per day. Daily throughput is
 * unchanged (the floor caps it at 4 tickets/hour regardless); only the collect
 * cadence stretches toward once-a-day as the engine matures.
 */
export const ENGINE_LEVEL_BASE_CAPACITY_TABLE: readonly number[] = [
  //  (lvl0) lvl1  lvl2  lvl3  lvl4  lvl5
  1, 1, 22, 43, 64, 86,
];

/**
 * The four curves as one value — the admin-tunable shape served by
 * `GET /config` (`engines.levelTables`, hook `useEngineConfig`). Every helper
 * below takes an optional `tables` and falls back to the bundled defaults, so
 * admin edits reach the UI math without a redeploy while plain calls (tests,
 * mocks, legacy code) keep working on the defaults.
 */
export interface EngineLevelTables {
  speedLevelBoostPct: readonly number[];
  capacityLevelBonusTickets: readonly number[];
  engineLevelSpeedBoostPct: readonly number[];
  engineLevelBaseCapacity: readonly number[];
}

export const DEFAULT_ENGINE_LEVEL_TABLES: EngineLevelTables = {
  speedLevelBoostPct: SPEED_LEVEL_BOOST_PCT_TABLE,
  capacityLevelBonusTickets: CAPACITY_LEVEL_BONUS_TICKETS_TABLE,
  engineLevelSpeedBoostPct: ENGINE_LEVEL_SPEED_BOOST_PCT_TABLE,
  engineLevelBaseCapacity: ENGINE_LEVEL_BASE_CAPACITY_TABLE,
};

/** Max SPEED / CAPACITY sub-level — derived from the ladder table length (0…10). */
export const MAX_BOOST_LEVEL = SPEED_LEVEL_BOOST_PCT_TABLE.length - 1;

/**
 * Hard ceiling on the engine level itself — derived from the engine-level table
 * length. Mirrors the backend (economy.constants.ts); keep the two in lockstep,
 * otherwise the optimistic upgrade path over-promotes past what the server will
 * accept and the UI drifts from the real engine state.
 * `tests/engine-table-parity.test.ts` diffs the default tables against the backend.
 */
export const MAX_ENGINE_LEVEL = ENGINE_LEVEL_BASE_CAPACITY_TABLE.length - 1;

/**
 * Live ceilings for a (possibly admin-overridden) table set. `min` of the pair
 * keeps a malformed override safe — the shorter ladder wins (mirrors the
 * backend's maxBoostLevel/maxEngineLevel in economy.util.ts).
 */
export const maxBoostLevel = (t: EngineLevelTables = DEFAULT_ENGINE_LEVEL_TABLES) =>
  Math.min(t.speedLevelBoostPct.length, t.capacityLevelBonusTickets.length) - 1;

export const maxEngineLevel = (t: EngineLevelTables = DEFAULT_ENGINE_LEVEL_TABLES) =>
  Math.min(t.engineLevelSpeedBoostPct.length, t.engineLevelBaseCapacity.length) - 1;

/** Table lookup with the level clamped into the table's own index range. */
const cell = (table: readonly number[], level: number) =>
  table[Math.min(table.length - 1, Math.max(0, Math.floor(level)))];

/** Total speed-boost percent contributed by the engine level itself. */
export const engineLevelBoostPct = (
  engineLevel: number,
  tables: EngineLevelTables = DEFAULT_ENGINE_LEVEL_TABLES
) => cell(tables.engineLevelSpeedBoostPct, engineLevel || 1);

/** Total speed-boost percent contributed by the speed-level upgrade. */
export const speedLevelBoostPct = (
  level: number,
  tables: EngineLevelTables = DEFAULT_ENGINE_LEVEL_TABLES
) => cell(tables.speedLevelBoostPct, level);

/** Absolute per-cycle ticket bonus contributed by the capacity-level upgrade. */
export const capacityLevelBonusTickets = (
  level: number,
  tables: EngineLevelTables = DEFAULT_ENGINE_LEVEL_TABLES
) => cell(tables.capacityLevelBonusTickets, level);

/**
 * @deprecated Kept for legacy UI labels. Returns the equivalent cycle-time
 * multiplier (0..1) derived from the additive boost — i.e. `1 / (1 + boost%)`.
 */
export const speedMultiplier = (level: number, tables?: EngineLevelTables) =>
  1 / (1 + speedLevelBoostPct(level, tables) / 100);

/** BASE per-cycle output (before % capacity boost) at this engine level. */
export const baseCapacity = (
  engineLevel: number,
  tables: EngineLevelTables = DEFAULT_ENGINE_LEVEL_TABLES
) => cell(tables.engineLevelBaseCapacity, engineLevel || 1);

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
    tables?: EngineLevelTables;
  }
) => {
  // VIP supersedes LP — higher-tier engine speed boost wins, no stacking.
  const statusBoostPct = options?.isVip
    ? GlobalConstants.vipEngineSpeedBoostPct
    : options?.isLuckyPlayer
      ? GlobalConstants.luckyPlayerEngineSpeedBoostPct
      : 0;

  let totalBoostPct =
    engineLevelBoostPct(engine.engineLevel || 1, options?.tables) +
    speedLevelBoostPct(engine.speedLevel || 0, options?.tables) +
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
    tables: options?.tables,
  });
  const floor = capacity * GlobalConstants.engineMinSecondsPerTicket;
  return Math.max(rawCycle, floor);
};

/**
 * Per-cycle output: `(baseCapacity + capacity-level bonus) × (1 + chips%)`.
 * The capacity sub-level adds **absolute tickets** (default +1 per paid tap —
 * the same +1 at every engine level); chips/boosters stay percentage-based
 * and scale the whole batch.
 */
export const engineCapacity = (
  engine: TicketEngine,
  options?: {
    capacityChip?: InventoryChip;
    capacityBooster?: InventoryBooster;
    tables?: EngineLevelTables;
  }
) => {
  let chipBoostPct = 0;
  if (options?.capacityChip) chipBoostPct += options.capacityChip.effectPct;
  if (options?.capacityBooster && isBoosterAlive(options.capacityBooster)) {
    chipBoostPct += options.capacityBooster.effectPct;
  }
  const batch =
    baseCapacity(engine.engineLevel || 1, options?.tables) +
    capacityLevelBonusTickets(engine.capacityLevel || 0, options?.tables);
  return Math.max(1, Math.round(batch * (1 + chipBoostPct / 100)));
};

export const engineElapsedSeconds = (engine: TicketEngine) => {
  const started = dayjs(engine.cycleStartedAt);
  const now = dayjs();
  return Math.max(0, now.diff(started, 'second'));
};

export const isEngineMaxed = (engine: TicketEngine, tables?: EngineLevelTables) =>
  (engine.speedLevel || 0) >= maxBoostLevel(tables) &&
  (engine.capacityLevel || 0) >= maxBoostLevel(tables);

/**
 * Engine promotion (level-up). When an engine's speed **and** capacity
 * sub-levels are both maxed (`isEngineMaxed`), the next paid upgrade promotes it
 * to the next **engine level** and resets both sub-levels to 0 — a fresh
 * 0–10 / 0–10 ladder on a stronger base (DOCS §10.2).
 *
 * Each engine level permanently adds `+100%` to the speed stack
 * (`engineLevelBoostPct`) and `+10` to base per-cycle output (`baseCapacity`,
 * `1 → 11 → 21 …`). At `MAX_ENGINE_LEVEL` the 10/10 state is terminal — the
 * ladders stay full instead of converting into another level (matches the
 * backend). Pure — no side effects beyond those two curves. Single source of
 * truth for the promotion rule; the optimistic upgrade paths in `engines.api`
 * and `HomeEnginesSlider` both call it so their math cannot drift.
 */
export const promoteEngineIfMaxed = (
  engine: TicketEngine,
  tables?: EngineLevelTables
): TicketEngine =>
  isEngineMaxed(engine, tables) && (engine.engineLevel ?? 1) < maxEngineLevel(tables)
    ? { ...engine, engineLevel: (engine.engineLevel ?? 1) + 1, speedLevel: 0, capacityLevel: 0 }
    : engine;

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
