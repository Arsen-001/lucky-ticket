import type { TicketType } from '@/types/types/ticket.types';

export type InventoryChipType = 'speed' | 'capacity';

/**
 * Chips are permanent. There is no second lifetime.
 *
 * The type carried `lifetime: 'permanent' | 'time-limited'` and a `remainingMs`
 * countdown until 17.08.2026 — a mechanic no server ever implemented: both
 * creation paths (mint, seed) wrote PERMANENT, nothing ever decremented the
 * counter, and no reward hands out a chip at all. So the whole timed branch
 * only ever rendered against a mock fixture, where it showed a countdown that
 * never moved. The timed layer of engine boosts is the BOOSTER (§10.6): 3–48 h,
 * one shot, tier-locked — see `InventoryBooster` below, which keeps every bit
 * of it.
 */
export interface InventoryChip {
  id: string;
  type: InventoryChipType;
  quality: TicketType;
  level: number;
  effectPct: number;
  shardsForNextLevel: number;
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
