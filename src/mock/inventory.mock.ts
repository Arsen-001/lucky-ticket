import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { InventorySnapshot } from '@/api/inventory.api';
import {
  CHIP_EFFECT_PER_LEVEL,
  CHIP_MINT_SHARD_COST,
  chipShardsForNextLevel,
} from '@/utils/global/inventory.utils';
import type {
  InventoryBooster,
  InventoryChip,
  InventoryChipType,
  InventoryShardCount,
} from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const initialChips: InventoryChip[] = [
  {
    id: 'chip-1',
    type: 'speed',
    quality: 'bronze',
    level: 6,
    effectPct: 10,
    shardsForNextLevel: 7,
    lifetime: 'permanent',
    source: 'tournament',
    equippedOnEngineId: 'engine-bronze-1',
  },
  {
    id: 'chip-2',
    type: 'speed',
    quality: 'bronze',
    level: 3,
    effectPct: 1.5,
    shardsForNextLevel: 5,
    lifetime: 'permanent',
    source: 'tournament',
  },
  {
    id: 'chip-3',
    type: 'speed',
    quality: 'bronze',
    level: 1,
    effectPct: 0.5,
    shardsForNextLevel: 1,
    lifetime: 'permanent',
    source: 'tournament',
  },
  {
    id: 'chip-4',
    type: 'capacity',
    quality: 'silver',
    level: 12,
    effectPct: 15,
    shardsForNextLevel: 13,
    lifetime: 'time-limited',
    remainingMs: 3 * 86400_000 + 4 * 3600_000,
    source: 'tournament',
    equippedOnEngineId: 'engine-bronze-1',
  },
  {
    id: 'chip-5',
    type: 'speed',
    quality: 'gold',
    level: 24,
    effectPct: 12,
    shardsForNextLevel: 25,
    lifetime: 'permanent',
    source: 'tournament',
  },
  {
    id: 'chip-6',
    type: 'capacity',
    quality: 'platinum',
    level: 48,
    effectPct: 24,
    shardsForNextLevel: 49,
    lifetime: 'permanent',
    source: 'tournament',
  },
  {
    id: 'chip-7',
    type: 'speed',
    quality: 'diamond',
    level: 80,
    effectPct: 40,
    shardsForNextLevel: 81,
    lifetime: 'time-limited',
    remainingMs: 6 * 3600_000 + 24 * 60_000,
    source: 'tournament',
  },
];

const initialShards: InventoryShardCount[] = [
  { type: 'speed', quality: 'bronze', count: 12 },
  { type: 'capacity', quality: 'bronze', count: 5 },
  { type: 'speed', quality: 'silver', count: 4 },
  { type: 'capacity', quality: 'silver', count: 8 },
  { type: 'speed', quality: 'gold', count: 2 },
  { type: 'capacity', quality: 'gold', count: 1 },
  { type: 'speed', quality: 'platinum', count: 0 },
  { type: 'capacity', quality: 'platinum', count: 3 },
  { type: 'speed', quality: 'diamond', count: 1 },
  { type: 'capacity', quality: 'diamond', count: 0 },
];

const initialBoosters: InventoryBooster[] = [
  {
    id: 'boost-1',
    type: 'speed',
    quality: 'bronze',
    durationHours: 3,
    effectPct: 25,
    source: 'task',
    activeOnEngineId: 'engine-bronze-1',
    expiresAt: new Date(Date.now() + 2 * 3600_000).toISOString(),
  },
  {
    id: 'boost-2',
    type: 'capacity',
    quality: 'bronze',
    durationHours: 6,
    effectPct: 50,
    source: 'shop',
    activeOnEngineId: 'engine-bronze-1',
    expiresAt: new Date(Date.now() + 4 * 3600_000).toISOString(),
  },
  {
    id: 'boost-3',
    type: 'speed',
    quality: 'silver',
    durationHours: 12,
    effectPct: 35,
    source: 'tournament',
  },
  {
    id: 'boost-4',
    type: 'capacity',
    quality: 'gold',
    durationHours: 24,
    effectPct: 75,
    source: 'shop',
  },
  {
    id: 'boost-5',
    type: 'speed',
    quality: 'platinum',
    durationHours: 48,
    effectPct: 50,
    source: 'tournament',
  },
  {
    id: 'boost-6',
    type: 'capacity',
    quality: 'diamond',
    durationHours: 48,
    effectPct: 100,
    source: 'tournament',
  },
];

let inventoryState: InventorySnapshot = {
  chips: initialChips,
  shards: initialShards,
  boosters: initialBoosters,
};

export const inventoryChipsMock = inventoryState.chips;
export const inventoryShardsMock = inventoryState.shards;
export const inventoryBoostersMock = inventoryState.boosters;

const getInventoryHandler = () => inventoryState;

const equipChipHandler = (args: FetchArgs) => {
  const body = (args.body ?? {}) as { chipId?: string; engineId?: string };
  const { chipId, engineId } = body;
  if (!chipId || !engineId) return inventoryState;
  const target = inventoryState.chips.find(c => c.id === chipId);
  if (!target) return inventoryState;
  inventoryState = {
    ...inventoryState,
    chips: inventoryState.chips.map(c => {
      if (c.id === chipId) return { ...c, equippedOnEngineId: engineId };
      if (c.equippedOnEngineId === engineId && c.type === target.type && c.id !== chipId) {
        return { ...c, equippedOnEngineId: undefined };
      }
      return c;
    }),
  };
  return inventoryState;
};

const unequipChipHandler = (args: FetchArgs) => {
  const body = (args.body ?? {}) as { chipId?: string };
  const { chipId } = body;
  if (!chipId) return inventoryState;
  inventoryState = {
    ...inventoryState,
    chips: inventoryState.chips.map(c =>
      c.id === chipId ? { ...c, equippedOnEngineId: undefined } : c
    ),
  };
  return inventoryState;
};

const levelUpChipHandler = (args: FetchArgs) => {
  const body = (args.body ?? {}) as { chipId?: string };
  const { chipId } = body;
  if (!chipId) return inventoryState;
  const chip = inventoryState.chips.find(c => c.id === chipId);
  if (!chip) return inventoryState;

  const available =
    inventoryState.shards.find(s => s.type === chip.type && s.quality === chip.quality)?.count ?? 0;
  if (available < chip.shardsForNextLevel) return inventoryState;

  const nextLevel = chip.level + 1;
  inventoryState = {
    ...inventoryState,
    shards: inventoryState.shards.map(s =>
      s.type === chip.type && s.quality === chip.quality
        ? { ...s, count: Math.max(0, s.count - chip.shardsForNextLevel) }
        : s
    ),
    chips: inventoryState.chips.map(c =>
      c.id === chipId
        ? {
            ...c,
            level: nextLevel,
            effectPct: nextLevel * CHIP_EFFECT_PER_LEVEL,
            shardsForNextLevel: chipShardsForNextLevel(nextLevel),
          }
        : c
    ),
  };
  return inventoryState;
};

const mintChipHandler = (args: FetchArgs) => {
  const body = (args.body ?? {}) as { type?: InventoryChipType; quality?: TicketType };
  const { type, quality } = body;
  if (!type || !quality) return inventoryState;

  const requiredShards = CHIP_MINT_SHARD_COST[quality];
  const shardCount =
    inventoryState.shards.find(s => s.type === type && s.quality === quality)?.count ?? 0;
  if (shardCount < requiredShards) return inventoryState;

  inventoryState = {
    ...inventoryState,
    shards: inventoryState.shards.map(s =>
      s.type === type && s.quality === quality ? { ...s, count: s.count - requiredShards } : s
    ),
    chips: [
      ...inventoryState.chips,
      {
        id: `chip-${Date.now()}`,
        type,
        quality,
        level: 1,
        effectPct: CHIP_EFFECT_PER_LEVEL,
        shardsForNextLevel: chipShardsForNextLevel(1),
        lifetime: 'permanent',
        source: 'tournament',
      },
    ],
  };
  return inventoryState;
};

const activateBoosterHandler = (args: FetchArgs) => {
  const body = (args.body ?? {}) as { boosterId?: string; engineId?: string };
  const { boosterId, engineId } = body;
  if (!boosterId || !engineId) return inventoryState;
  const target = inventoryState.boosters.find(b => b.id === boosterId);
  if (!target) return inventoryState;

  const expiresAt = new Date(Date.now() + target.durationHours * 3600_000).toISOString();

  inventoryState = {
    ...inventoryState,
    boosters: inventoryState.boosters.map(b => {
      if (b.id === boosterId) return { ...b, activeOnEngineId: engineId, expiresAt };
      if (b.activeOnEngineId === engineId && b.type === target.type && b.id !== boosterId) {
        return { ...b, activeOnEngineId: undefined, expiresAt: undefined };
      }
      return b;
    }),
  };
  return inventoryState;
};

export const inventoryMock = {
  inventory: getInventoryHandler,
  'POST inventory/chip/equip': equipChipHandler,
  'POST inventory/chip/unequip': unequipChipHandler,
  'POST inventory/chip/level-up': levelUpChipHandler,
  'POST inventory/chip/mint': mintChipHandler,
  'POST inventory/booster/activate': activateBoosterHandler,
};
