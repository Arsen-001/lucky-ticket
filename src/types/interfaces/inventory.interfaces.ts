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

export type InventoryBoosterDuration = 3 | 6 | 12 | 24 | 48;

export interface InventoryBooster {
  id: string;
  type: InventoryChipType;
  quality: TicketType;
  durationHours: InventoryBoosterDuration;
  effectPct: number;
  source: 'shop' | 'task' | 'tournament';
  activeOnEngineId?: string;
  expiresAt?: string;
}
