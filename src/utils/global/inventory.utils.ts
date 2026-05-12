import { Cpu, type LucideIcon, MemoryStick } from 'lucide-react';
import type { TicketType } from '@/types/types/ticket.types';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';

export const QUALITY_ACCENT: Record<TicketType, string> = {
  bronze: 'var(--color-bronze)',
  silver: 'var(--color-silver)',
  gold: 'var(--color-gold)',
  platinum: 'var(--color-platinum)',
  diamond: 'var(--color-diamond)',
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

export const chipShardsForNextLevel = (currentLevel: number) => {
  const target = currentLevel + 1;
  if (target <= 1) return 1;
  if (target === 2) return 1;
  if (target === 3) return 3;
  return 2 * target - 3;
};

export const tierRank = (tier: TicketType): number => QUALITY_TIERS.indexOf(tier);

export const canEquipChipOnTier = (chipQuality: TicketType, engineTier: TicketType): boolean =>
  tierRank(chipQuality) >= tierRank(engineTier);

export const chipEquipStarsCost = (chipLevel: number): number => Math.max(1, chipLevel);

export const chipUnequipStarsCost = (chipLevel: number): number =>
  Math.max(1, Math.ceil(chipLevel / 2));

export const findEquippedChip = (
  chips: import('@/types/interfaces/inventory.interfaces').InventoryChip[] | undefined,
  engineId: string,
  type: InventoryChipType
) => chips?.find(c => c.equippedOnEngineId === engineId && c.type === type);

export const findActiveBooster = (
  boosters: import('@/types/interfaces/inventory.interfaces').InventoryBooster[] | undefined,
  engineId: string,
  type: InventoryChipType
) => boosters?.find(b => b.activeOnEngineId === engineId && b.type === type);
