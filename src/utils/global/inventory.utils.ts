import { Cpu, type LucideIcon, MemoryStick } from 'lucide-react';
import type { StaticImageData } from 'next/image';
import { icons } from '@/constants/icons';
import type { TicketType } from '@/types/types/ticket.types';
import type { Dictionary, MessageIds } from '@/types/types/i18n.types';
import type { InventoryChip, InventoryChipType } from '@/types/interfaces/inventory.interfaces';

export const QUALITY_ACCENT: Record<TicketType, string> = {
  bronze: 'var(--color-bronze)',
  silver: 'var(--color-silver)',
  gold: 'var(--color-gold)',
  platinum: 'var(--color-platinum)',
  diamond: 'var(--color-diamond)',
};

export const CHIP_ASSET: Record<TicketType, Record<InventoryChipType, StaticImageData>> = {
  bronze: { speed: icons.bronzeTimeChip, capacity: icons.bronzeCapacityChip },
  silver: { speed: icons.silverTimeChip, capacity: icons.silverCapacityChip },
  gold: { speed: icons.goldenTimeChip, capacity: icons.goldenCapacityChip },
  platinum: { speed: icons.platinumTimeChip, capacity: icons.platinumCapacityChip },
  diamond: { speed: icons.diamondTimeChip, capacity: icons.diamondCapacityChip },
};

export const CHIP_SHARD_ASSET: Record<TicketType, Record<InventoryChipType, StaticImageData>> = {
  bronze: { speed: icons.bronzeTimeShard, capacity: icons.bronzeCapacityShard },
  silver: { speed: icons.silverTimeShard, capacity: icons.silverCapacityShard },
  gold: { speed: icons.goldenTimeShard, capacity: icons.goldenCapacityShard },
  platinum: { speed: icons.platinumTimeShard, capacity: icons.platinumCapacityShard },
  diamond: { speed: icons.diamondTimeShard, capacity: icons.diamondCapacityShard },
};

export const TYPE_ACCENT: Record<InventoryChipType, string> = {
  speed: 'var(--color-electric-pink)',
  capacity: 'var(--color-gold)',
};

export const CHIP_TYPE_ICON: Record<InventoryChipType, LucideIcon> = {
  speed: Cpu,
  capacity: MemoryStick,
};

export const QUALITY_TIERS: TicketType[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

/* ────────────────────────────────────────────────────────────────────────────
 *  🔩  CHIP RULES — "a finished chip is half an engine" (17.08.2026)
 *
 *  Ten levels. A finished capacity chip adds +51 tickets to the batch — half
 *  of a fully upgraded engine's 102; a finished speed chip halves the cycle —
 *  it is a MULTIPLIER on top of the engine's additive speed stack, so it is
 *  worth the same ×2 on a fresh engine (2 h → 1 h) and on a maxed one
 *  (24 h → 12 h). Both are priced identically: 200 shards mint-to-max, and a
 *  Bronze shard is 1 ⭐ (LC at parity), so a finished chip is 200 ⭐ — a
 *  quarter of a full engine's 800 ⭐ for half its power.
 *
 *  Before this the effect was +0.5 % per level to a 200-level ceiling, and a
 *  capacity chip's % rounded to the same single ticket from level 1 to 16 —
 *  a player could sink 256 shards into it and mint nothing extra. Level, not
 *  `effectPct`, is the source of truth: every helper below derives from it.
 *  The backend mirrors these tables in economy.constants.ts.
 * ──────────────────────────────────────────────────────────────────────────── */

export const CHIP_MAX_LEVEL = 10;

/** Shards to mint a level-1 chip — the same for every tier now: the tier
 *  difference lives in the shard PRICE (×2 per tier), not the count. */
export const CHIP_MINT_SHARDS = 20;

/** Shards for the step from `level` to `level + 1` (12, 14, … 28). With the
 *  mint that is exactly 200 to the top. */
export const chipLevelUpShards = (level: number): number =>
  level >= CHIP_MAX_LEVEL ? 0 : 10 + 2 * level;

/** Extra tickets per collect a CAPACITY chip of `level` adds — the batch
 *  grows by 5 a level, the tenth adds 6, so the top is exactly +51. */
export const CHIP_CAPACITY_TICKETS_TABLE: readonly number[] = [
  //  lvl0  lvl1  lvl2  lvl3  lvl4  lvl5  lvl6  lvl7  lvl8  lvl9  lvl10
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 51,
];

export const chipCapacityTickets = (level: number | undefined): number =>
  CHIP_CAPACITY_TICKETS_TABLE[Math.min(CHIP_MAX_LEVEL, Math.max(0, Math.floor(level ?? 0)))];

/**
 * The cycle divisor a SPEED chip of `level` applies — 1.1 … 2.0. Applied AFTER
 * the engine's additive stack, never summed into it: `cycle = baseline ÷
 * (1 + engineStack) ÷ chipSpeedFactor`.
 */
export const chipSpeedFactor = (level: number | undefined): number =>
  1 + Math.min(CHIP_MAX_LEVEL, Math.max(0, Math.floor(level ?? 0))) / 10;

/** The same speed chip as a percentage — what the UI prints (+10 … +100 %). */
export const chipSpeedPct = (level: number | undefined): number =>
  Math.round((chipSpeedFactor(level) - 1) * 100);

/**
 * The one-line effect a chip prints on a slot, a card or a confirm — its
 * level's worth in the chip's own unit: "+10%" for speed, "+5 tickets" for
 * capacity. One helper so the five places that print it can never disagree.
 */
export const chipEffectLabel = (
  chip: Pick<InventoryChip, 'type' | 'level'>,
  t: (key: MessageIds, values?: Record<string, number>) => string
): string =>
  chip.type === 'speed'
    ? `+${chipSpeedPct(chip.level)}%`
    : t('chip capacity effect', { n: chipCapacityTickets(chip.level) });

/**
 * Backwards-compatible mint-cost map: the callers that read a per-tier cost
 * still work, and every tier now reads the same number.
 */
export const CHIP_MINT_SHARD_COST: Record<TicketType, number> = {
  bronze: CHIP_MINT_SHARDS,
  silver: CHIP_MINT_SHARDS,
  gold: CHIP_MINT_SHARDS,
  platinum: CHIP_MINT_SHARDS,
  diamond: CHIP_MINT_SHARDS,
};

/**
 * What one stack of shards is called.
 *
 * Not authored copy — a tier plus a type, composed through a pattern key so
 * each language owns its own word order ("Gold Time Shard", "Осколок скорости
 * Золото"). It is the SAME string the market prints on the card that sells
 * them, deliberately: the vault has to name a stack the way the player last
 * saw it named, or the two screens read as two different items.
 *
 * The tier arrives lowercase from the inventory and uppercase from some market
 * payloads, and only one of those is a message key.
 */
export const chipShardName = (t: Dictionary, type: InventoryChipType, quality: string) =>
  t(type === 'speed' ? 'market speed shard name' : 'market capacity shard name', {
    tier: t(quality.toLowerCase() as MessageIds),
  });

/** Shards the NEXT level costs from `currentLevel` — the same ladder the
 *  server writes into `shardsForNextLevel`; 0 at the top. */
export const chipShardsForNextLevel = (currentLevel: number) => chipLevelUpShards(currentLevel);

export const tierRank = (tier: TicketType): number => QUALITY_TIERS.indexOf(tier);

/**
 * How long a time-limited chip has left, at the coarsest unit that still says
 * something: days until the last day, then hours, then minutes.
 */
export const formatChipRemaining = (
  remainingMs: number,
  t: import('@/types/types/i18n.types').Dictionary
) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (days > 0) return t('{n}d left', { n: days });
  if (hours > 0) return t('{n}h left', { n: hours });
  return t('{n}m left', { n: minutes });
};

/**
 * Every engine the player owns, paired with the chips sitting in its two slots.
 *
 * The inventory screen needs the same list the equip modal builds (tickets →
 * engines, strongest tier first), but with the installed chips resolved: a chip
 * card that says "equipped" without saying WHERE is the one thing the old
 * screen could not answer, and "1 of 4 slots" is only meaningful next to the
 * engines that own those slots.
 */
export interface EngineSlotInfo {
  id: string;
  tier: TicketType;
  /** 1-based number shown to the player — engines have no name of their own. */
  number: number;
  speedChip?: import('@/types/interfaces/inventory.interfaces').InventoryChip;
  capacityChip?: import('@/types/interfaces/inventory.interfaces').InventoryChip;
}

export const buildEngineSlots = (
  tickets: { blocked?: boolean; ticketType: TicketType; engines?: { id: string }[] }[] | undefined,
  chips: import('@/types/interfaces/inventory.interfaces').InventoryChip[] | undefined
): EngineSlotInfo[] =>
  (tickets ?? [])
    .filter(ticket => !ticket.blocked && ticket.engines?.length)
    .flatMap(ticket =>
      (ticket.engines ?? []).map(engine => ({ id: engine.id, tier: ticket.ticketType }))
    )
    .sort((a, b) => tierRank(b.tier) - tierRank(a.tier))
    .map((engine, index) => ({
      ...engine,
      number: index + 1,
      speedChip: findEquippedChip(chips, engine.id, 'speed'),
      capacityChip: findEquippedChip(chips, engine.id, 'capacity'),
    }));

export interface InventoryTypeStats {
  /** Summed effect of every chip of this type currently in a slot. */
  totalPct: number;
  /** Slots of this type filled, out of one per engine. */
  filled: number;
  slots: number;
}

export const inventoryTypeStats = (
  slots: EngineSlotInfo[],
  type: InventoryChipType
): InventoryTypeStats => {
  const installed = slots
    .map(slot => (type === 'speed' ? slot.speedChip : slot.capacityChip))
    .filter(Boolean);
  return {
    // Speed chips: their percentages; capacity chips: their tickets. Both are
    // "how much this type adds across the fleet", each in its own unit.
    totalPct: installed.reduce(
      (sum, chip) =>
        sum + (type === 'speed' ? chipSpeedPct(chip?.level) : chipCapacityTickets(chip?.level)),
      0
    ),
    filled: installed.length,
    slots: slots.length,
  };
};

/**
 * Display order for a chip collection: what can be acted on first.
 *
 * A flat list in whatever order the backend returned buries the one chip whose
 * upgrade is already paid for behind six that are not. Ready-to-level first,
 * then the ones actually installed, then by tier and level.
 */
export const sortChipsForDisplay = (
  chips: import('@/types/interfaces/inventory.interfaces').InventoryChip[],
  shards: import('@/types/interfaces/inventory.interfaces').InventoryShardCount[]
) =>
  [...chips].sort((a, b) => {
    const readyDelta =
      Number(isChipReadyToLevelUp(b, shards)) - Number(isChipReadyToLevelUp(a, shards));
    if (readyDelta !== 0) return readyDelta;
    const equippedDelta = Number(!!b.equippedOnEngineId) - Number(!!a.equippedOnEngineId);
    if (equippedDelta !== 0) return equippedDelta;
    const tierDelta = tierRank(b.quality) - tierRank(a.quality);
    if (tierDelta !== 0) return tierDelta;
    return b.level - a.level;
  });

/** A chip whose next level is already paid for by the shards on hand. */
export const isChipReadyToLevelUp = (
  chip: import('@/types/interfaces/inventory.interfaces').InventoryChip,
  shards: import('@/types/interfaces/inventory.interfaces').InventoryShardCount[]
): boolean =>
  (shards.find(s => s.type === chip.type && s.quality === chip.quality)?.count ?? 0) >=
  chip.shardsForNextLevel;

export const canEquipChipOnTier = (chipQuality: TicketType, engineTier: TicketType): boolean =>
  chipQuality === engineTier;

/**
 * Attaching a chip is free; only taking one OFF costs Stars, its level's worth
 * (17.08.2026 — attach used to cost the level and detach half of it). A chip is
 * earned once and meant to be used; the price sits on shuffling it around a
 * fleet, not on using it at all.
 */
export const chipEquipStarsCost = (_chipLevel: number): number => 0;

export const chipUnequipStarsCost = (chipLevel: number): number => Math.max(1, chipLevel);

/**
 * What the server will actually take to put this chip on `targetEngineId`.
 *
 * A chip that already sits on ANOTHER engine is a move, and a move pays the
 * detach on top of the attach (DOCS §10.4, mirrored in
 * `inventory.service.equipChip`) — so a screen quoting the bare equip price
 * promises less than the balance loses. Zero when the chip is already in that
 * slot: the server charges nothing for an equip that moves nothing.
 */
export const chipSlotStarsCost = (
  chip: Pick<InventoryChip, 'level' | 'equippedOnEngineId'>,
  targetEngineId?: string
): number => {
  if (chip.equippedOnEngineId && chip.equippedOnEngineId === targetEngineId) return 0;
  return (
    chipEquipStarsCost(chip.level) +
    (chip.equippedOnEngineId ? chipUnequipStarsCost(chip.level) : 0)
  );
};

export const findEquippedChip = (
  chips: import('@/types/interfaces/inventory.interfaces').InventoryChip[] | undefined,
  engineId: string,
  type: InventoryChipType
) => chips?.find(c => c.equippedOnEngineId === engineId && c.type === type);

/**
 * The booster still RUNNING on this engine's slot.
 *
 * A booster is a time-limited consumable (3–48h by tier), but the row keeps its
 * `activeOnEngineId` after the window closes — matching on the assignment alone
 * counted an expired booster forever, so a cycle on screen stayed permanently
 * faster than the one the server mints at. `expiresAt` is the authority.
 *
 * A missing `expiresAt` does NOT revoke the boost: it means the window is
 * unknown (older payload, or a booster the backend never dated), and that is
 * not evidence it ran out — the same rule the backend applies to a Lucky Player
 * subscription with no recorded expiry.
 *
 * `now` is injectable so the boost can be recomputed off a ticking clock rather
 * than only when something else happens to re-render.
 *
 * Two boosters of one type can sit on one engine — activation never cleared the
 * slot — so the STRONGEST running one wins. That is the rule the server applies
 * (`activeBoosterPct`), and it has to be the same one here: "whichever comes
 * first in the array" is not something two codebases can agree on.
 */
export const findActiveBooster = (
  boosters: import('@/types/interfaces/inventory.interfaces').InventoryBooster[] | undefined,
  engineId: string,
  type: InventoryChipType,
  now: number = Date.now()
) =>
  boosters
    ?.filter(
      b =>
        b.activeOnEngineId === engineId &&
        b.type === type &&
        (!b.expiresAt || new Date(b.expiresAt).getTime() > now)
    )
    .reduce<
      import('@/types/interfaces/inventory.interfaces').InventoryBooster | undefined
    >((best, b) => (!best || b.effectPct > best.effectPct ? b : best), undefined);
