import type { TicketType } from '@/types/types/ticket.types';

export type InventoryChipType = 'speed' | 'capacity';
export type InventoryChipLifetime = 'permanent' | 'time-limited';

export interface InventoryChip {
  id: string;
  type: InventoryChipType;
  quality: TicketType;
  level: number;
  effectPct: number;
  shardsForNextLevel: number;
  lifetime: InventoryChipLifetime;
  remainingMs?: number;
  source: 'tournament';
  equippedOnEngineId?: string;
}

export interface InventoryShardCount {
  type: InventoryChipType;
  quality: TicketType;
  count: number;
}

/**
 * What every inventory layout needs from the container.
 *
 * The screen's data and mutations stay in one place (`InventoryContainer`);
 * a view is pure presentation, so swapping the layout can never change what
 * equipping a chip does.
 */
export interface InventoryViewProps {
  chips: InventoryChip[];
  shards: InventoryShardCount[];
  boosters: InventoryBooster[];
  slots: import('@/utils/global/inventory.utils').EngineSlotInfo[];
  isLoading: boolean;
  levelingUpChipId?: string;
  unequippingChipId?: string;
  onEquip: (chip: InventoryChip) => void;
  onUnequip: (chip: InventoryChip) => void;
  onLevelUp: (chip: InventoryChip) => void;
  onActivateBooster: (booster: InventoryBooster) => void;
  onMint: () => void;
}

export type InventoryBoosterDuration = 3 | 4 | 6 | 12 | 24 | 48;

export interface InventoryBooster {
  id: string;
  type: InventoryChipType;
  quality: TicketType;
  durationHours: InventoryBoosterDuration;
  effectPct: number;
  source: 'market' | 'task' | 'tournament';
  activeOnEngineId?: string;
  expiresAt?: string;
}
