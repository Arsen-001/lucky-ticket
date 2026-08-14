import { Cpu, type LucideIcon, MemoryStick } from 'lucide-react';
import type { StaticImageData } from 'next/image';
import { icons } from '@/constants/icons';
import type { TicketType } from '@/types/types/ticket.types';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';

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

export const CHIP_EFFECT_PER_LEVEL = 0.5;
export const CHIP_MAX_LEVEL = 200;

/**
 * Shards consumed to mint a fresh Lvl-1 chip of that tier — mirrors the
 * backend `CHIP_MINT_SHARD_COST` (DOCS §10.4). Lower tiers drop shards far
 * more often, so their mint is priced higher; no other cost applies.
 */
export const CHIP_MINT_SHARD_COST: Record<TicketType, number> = {
  bronze: 10,
  silver: 8,
  gold: 6,
  platinum: 4,
  diamond: 2,
};

export const chipShardsForNextLevel = (currentLevel: number) => {
  const target = currentLevel + 1;
  if (target <= 1) return 1;
  if (target === 2) return 1;
  if (target === 3) return 3;
  return 2 * target - 3;
};

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
    totalPct: installed.reduce((sum, chip) => sum + (chip?.effectPct ?? 0), 0),
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

export const chipEquipStarsCost = (chipLevel: number): number => Math.max(1, chipLevel);

export const chipUnequipStarsCost = (chipLevel: number): number =>
  Math.max(1, Math.ceil(chipLevel / 2));

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
