import dayjs from 'dayjs';
import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { StatusPerks } from '@/types/interfaces/user.interfaces';
import type { Ticket, TicketType } from '@/types/types/ticket.types';
import { effectiveStatusPct } from '@/utils/global/status.utils';
import { chipCapacityTickets, chipSpeedFactor } from '@/utils/global/inventory.utils';

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
 * Default: linear +2 % / level → 0…20 %.
 *
 * Re-tuned 16.08.2026 from +10 %/level (0…100 %) together with
 * `ENGINE_LEVEL_SPEED_BOOST_PCT_TABLE`. With the speed math fixed every percent
 * here multiplies the mining rate, so the old +100 % from ten taps alone would
 * have tripled ticket emission. Compression is also what makes the OTHER levers
 * weigh something: at +500 % on a maxed engine a VIP-20 perk moved it 3 %; at
 * these numbers the same perk moves it 10–20 %.
 */
export const SPEED_LEVEL_BOOST_PCT_TABLE: readonly number[] = [
  //  lvl0  lvl1  lvl2  lvl3  lvl4  lvl5  lvl6  lvl7  lvl8  lvl9  lvl10
  0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
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
 * Default: 0 / 35 / 120 / 265 / 475.
 *
 * ⚠️ Each step is DERIVED, not chosen: level N+1 = level N + the ten speed
 * taps (+20 %) + `ENGINE_FULL_LEVEL_SPEED_BONUS_PCT_TABLE[N]`. Promotion resets
 * the speed sub-ladder to 0 and forfeits the full-level bonus, so the level's
 * step must hand back exactly what was lost — otherwise promoting an engine
 * makes it slower, which `tests/engine-levers.test.ts` fails on.
 */
export const ENGINE_LEVEL_SPEED_BOOST_PCT_TABLE: readonly number[] = [
  //  (lvl0) lvl1  lvl2  lvl3  lvl4  lvl5
  0, 0, 35, 120, 265, 475,
];

/**
 * Speed **%** a level pays out the moment BOTH sub-ladders reach 10/10 — the
 * reward for finishing the level, on top of the taps. Indexed by `engineLevel`.
 *
 * Fitted, not round: together with the growing ticket bonus below it makes
 * every FULLY upgraded level mint its whole batch in about a day (18 h at
 * level 1, ~25 h at 2–4) and the top level in exactly 24 h — 102 tickets ×
 * 2 h of Bronze base = 204 h, divided by 1 + 750 %. "A finished level collects
 * once a day" is the rule the numbers serve.
 */
export const ENGINE_FULL_LEVEL_SPEED_BONUS_PCT_TABLE: readonly number[] = [
  //  (lvl0) lvl1  lvl2  lvl3  lvl4  lvl5
  0, 15, 65, 125, 190, 255,
];

/**
 * BASE per-cycle output — **absolute** ticket count before any % capacity boost —
 * at each engine LEVEL. Indexed by `engineLevel` DIRECTLY (1…`MAX_ENGINE_LEVEL`);
 * index 0 mirrors level 1. Default: 1 → 12 → 27 → 47 → 72.
 *
 * ⚠️ Each step is DERIVED, not chosen: level N+1 = level N + the ten capacity
 * taps (+1 each) + `ENGINE_FULL_LEVEL_BONUS_TICKETS_TABLE[N]`. Promotion resets
 * the sub-ladder and forfeits the full-level bonus, so a maxed level-N engine
 * holds exactly the base of level N+1 and the promotion is seamless — 12
 * tickets before, 12 after, same cycle, same rate.
 *
 * Every ticket here carries its own tier cycle (@see baselineCycleSeconds), so
 * capacity sets how big and how rare a collect is.
 */
export const ENGINE_LEVEL_BASE_CAPACITY_TABLE: readonly number[] = [
  //  (lvl0) lvl1  lvl2  lvl3  lvl4  lvl5
  1, 1, 12, 27, 47, 72,
];

/**
 * Tickets a level pays out the moment BOTH sub-ladders reach 10/10 — the reward
 * for finishing the level, on top of the +1 each tap gave. Indexed by
 * `engineLevel`. Grows with the level (1 · 5 · 10 · 15 · 20), so the fifth
 * finished level is worth twenty taps' worth of tickets, the first one tap's.
 * Across the whole ladder it adds +51 to a maxed Bronze engine's 102 tickets.
 */
export const ENGINE_FULL_LEVEL_BONUS_TICKETS_TABLE: readonly number[] = [
  //  (lvl0) lvl1  lvl2  lvl3  lvl4  lvl5
  0, 1, 5, 10, 15, 20,
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
 * The engine's cycle BEFORE any speed boost: **one ticket costs one tier
 * cycle**, so a batch of N tickets is scheduled over N × `engine.cycleSeconds`.
 *
 * Bronze mints 1 ticket in 2:00; buy one capacity tap and it mints 2 tickets in
 * 4:00, then 3 in 6:00. Capacity is the size of the collect — how much comes at
 * once and how rarely — and it never changes tickets per hour. Everything on
 * the speed side (level, speed taps, chip, booster, status, badge, avatar)
 * divides this baseline and IS what makes the engine mine faster.
 *
 * Exported because the UI quotes the equation `baseline ÷ (1 + boost) = cycle`
 * on the reactor face: reading a different baseline there would print an
 * equation that does not resolve to the countdown next to it.
 */
export const baselineCycleSeconds = (
  engine: TicketEngine,
  options?: {
    capacityChip?: InventoryChip;
    capacityBooster?: InventoryBooster;
    tables?: EngineLevelTables;
  }
) => engineCapacity(engine, options) * engine.cycleSeconds;

/**
 * Lords-Mobile-style additive boost stacking. All speed-boost sources sum
 * their percentages, and the final cycle is `baseline / (1 + totalBoost%)`
 * (@see baselineCycleSeconds).
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
    /**
     * Permanent Test-Quest ("Тестировщик") badge speed boost % — a third
     * additive layer on top of the status/avatar boosts (see
     * `testBadgeSpeedBoostPct`). Must be passed wherever the backend applies it
     * (it does, in `computeEngineState`) or a badge holder's cycle drifts.
     */
    badgeBoostPct?: number;
    /** `me.statusPerks` — the per-level status boost the server actually applies. */
    perks?: Pick<StatusPerks, 'engineSpeedBoostPct'>;
    tables?: EngineLevelTables;
  }
) => {
  // VIP supersedes LP — higher-tier engine speed boost wins, no stacking. The
  // per-level value comes from `me.statusPerks`; the constants are the ceiling
  // and only stand in when the backend didn't send perks.
  const statusBoostPct = effectiveStatusPct(
    'engineSpeedBoostPct',
    options?.isLuckyPlayer ?? false,
    options?.isVip ?? false,
    options?.perks
  );

  let totalBoostPct =
    engineLevelBoostPct(engine.engineLevel || 1, options?.tables) +
    speedLevelBoostPct(engine.speedLevel || 0, options?.tables) +
    fullLevelSpeedBonusPct(engine, options?.tables) +
    statusBoostPct +
    (options?.avatarBoostPct ?? 0) +
    (options?.badgeBoostPct ?? 0);

  if (options?.speedBooster && isBoosterAlive(options.speedBooster)) {
    totalBoostPct += options.speedBooster.effectPct;
  }

  // The speed CHIP is not a term in that sum — it divides the result. A finished
  // chip halves the cycle whatever the engine already runs at (2 h → 1 h on a
  // fresh engine, 24 h → 12 h on a maxed one); as a summand it would be worth
  // ×2 on the first and ×1.12 on the second. @see chipSpeedFactor
  return (
    baselineCycleSeconds(engine, {
      capacityChip: options?.capacityChip,
      capacityBooster: options?.capacityBooster,
      tables: options?.tables,
    }) /
    (1 + totalBoostPct / 100) /
    chipSpeedFactor(options?.speedChip?.level)
  );
};

/**
 * Per-cycle output — everything the player collects in one cycle: the engine
 * level's base, +1 per paid capacity tap, plus the equipped chip and booster.
 *
 * Each of these tickets carries its own tier cycle (@see baselineCycleSeconds),
 * so this number sets how BIG and how RARE a collect is, never how fast the
 * engine mines. The chip/booster share rounds UP so even a 1-ticket engine
 * gains a whole ticket from a boost.
 */
export const engineCapacity = (
  engine: TicketEngine,
  options?: {
    capacityChip?: InventoryChip;
    capacityBooster?: InventoryBooster;
    tables?: EngineLevelTables;
  }
) => {
  const batch =
    baseCapacity(engine.engineLevel || 1, options?.tables) +
    capacityLevelBonusTickets(engine.capacityLevel || 0, options?.tables) +
    // Taking BOTH sub-ladders to 10/10 pays a flat bonus on top of the taps.
    fullLevelBonusTickets(engine, options?.tables) +
    // The capacity CHIP adds whole tickets, never a percentage: as a % of the
    // batch it rounded to the same single ticket from level 1 to 16 on any
    // engine below level 2. @see chipCapacityTickets
    chipCapacityTickets(options?.capacityChip?.level);
  // The time-limited booster stays a % of the whole collect (chip included).
  // Round the share UP, not the product: tickets are whole, and rounding the
  // product handed nothing for a +25 % booster on a 1-ticket batch.
  const boosterPct =
    options?.capacityBooster && isBoosterAlive(options.capacityBooster)
      ? options.capacityBooster.effectPct
      : 0;
  return Math.max(1, batch + Math.ceil((batch * boosterPct) / 100));
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
 * The finished-level rewards — paid while BOTH sub-ladders sit at 10/10, and
 * folded into the next level's base tables the moment the engine promotes, so
 * they are never lost and never double-counted.
 */
export const fullLevelBonusTickets = (engine: TicketEngine, tables?: EngineLevelTables) =>
  isEngineMaxed(engine, tables)
    ? cell(ENGINE_FULL_LEVEL_BONUS_TICKETS_TABLE, engine.engineLevel || 1)
    : 0;

export const fullLevelSpeedBonusPct = (engine: TicketEngine, tables?: EngineLevelTables) =>
  isEngineMaxed(engine, tables)
    ? cell(ENGINE_FULL_LEVEL_SPEED_BONUS_PCT_TABLE, engine.engineLevel || 1)
    : 0;

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
 * How many tickets a claim actually awarded — what the celebration modal shows.
 *
 * Prefer the server's own `claimed`: the locally summed `pendingCount` is a
 * prediction that can be a tick stale. `completeEngineCycle` fires on a 1s
 * interval, so an engine can flip to ready (or a second device can drain the
 * tier) between the sum and the server handling the claim — and the modal would
 * then promise tickets that never landed in the inventory.
 *
 * Falls back to the local total when the response omits the field: the mock
 * holds no engine state and cannot know the number (see `engines.mock.ts`),
 * and an older backend may not send it either. A negative or non-finite value
 * is treated as absent — a `claimed: -1` must not render as "-1 tickets".
 */
export const resolveClaimedCount = (
  response: { claimed?: number } | undefined,
  localTotal: number
): number =>
  typeof response?.claimed === 'number' &&
  Number.isFinite(response.claimed) &&
  response.claimed >= 0
    ? response.claimed
    : localTotal;

/** One engine's share of an optimistic claim — what the patch predicted it gave. */
export interface DrainedEngine {
  engineId: string;
  amount: number;
}

/**
 * Splits a claim shortfall back across the engines an optimistic patch drained.
 *
 * A claim answers with a TOTAL, so when the server claims fewer tickets than
 * predicted there is no way to know which engine fell short — any per-engine
 * split is arbitrary. What is not arbitrary is the invariant: the givebacks must
 * sum to exactly the shortfall, or `lifetimeProduced` drifts permanently (the
 * claim mutations skip the `tickets` invalidation on purpose, so nothing
 * refetches these counters on this path).
 *
 * Walks newest-drained first and never takes back more than an engine
 * contributed. A non-positive shortfall (the server claimed as much as
 * predicted, or more — a cache one cycle behind the server) gives back nothing.
 */
export const distributeClaimShortfall = (
  drained: readonly DrainedEngine[],
  shortfall: number
): Map<string, number> => {
  const giveback = new Map<string, number>();
  let remaining = Math.max(0, shortfall);
  for (let index = drained.length - 1; index >= 0 && remaining > 0; index--) {
    const { engineId, amount } = drained[index];
    const share = Math.min(remaining, Math.max(0, amount));
    if (share > 0) giveback.set(engineId, (giveback.get(engineId) ?? 0) + share);
    remaining -= share;
  }
  return giveback;
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
