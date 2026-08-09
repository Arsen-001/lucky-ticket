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
 */
export const findActiveBooster = (
  boosters: import('@/types/interfaces/inventory.interfaces').InventoryBooster[] | undefined,
  engineId: string,
  type: InventoryChipType,
  now: number = Date.now()
) =>
  boosters?.find(
    b =>
      b.activeOnEngineId === engineId &&
      b.type === type &&
      (!b.expiresAt || new Date(b.expiresAt).getTime() > now)
  );
