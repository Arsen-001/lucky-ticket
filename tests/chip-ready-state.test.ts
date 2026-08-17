import { describe, it, expect } from 'vitest';
import {
  CHIP_MAX_LEVEL,
  chipShardsForNextLevel,
  isChipMaxed,
  isChipReadyToLevelUp,
  sortChipsForDisplay,
} from '@/utils/global/inventory.utils';
import type { InventoryChip, InventoryShardCount } from '@/types/interfaces/inventory.interfaces';

/**
 * "Ready to upgrade" must mean a level can actually be bought.
 *
 * The ten-level ladder (17.08.2026) made `chipLevelUpShards` return **0** at
 * the top, and the readiness check was a bare `shardsOnHand >= cost` — which
 * every account satisfies against zero. A finished chip therefore led the
 * sorted list, counted toward the tab's `N↑` badge and headlined the
 * "ready to upgrade" group, where its own row printed "Max" and offered no
 * button. The old 200-level ceiling hid this: no chip ever reached it.
 *
 * Pinned here because the defect is invisible in the fixtures a low-level
 * account produces — it only shows once a chip is finished.
 */

const chip = (over: Partial<InventoryChip> = {}): InventoryChip => ({
  id: 'c1',
  type: 'speed',
  quality: 'bronze',
  level: 1,
  effectPct: 10,
  shardsForNextLevel: chipShardsForNextLevel(1),
  lifetime: 'permanent',
  source: 'tournament',
  ...over,
});

const shards = (count: number): InventoryShardCount[] => [
  { type: 'speed', quality: 'bronze', count },
];

describe('a finished chip is never "ready to upgrade"', () => {
  it('knows the top of the ladder from either the level or its shard cache', () => {
    expect(isChipMaxed(chip({ level: CHIP_MAX_LEVEL, shardsForNextLevel: 0 }))).toBe(true);
    // A stale cache on a maxed chip, and a fresh cache the server zeroed.
    expect(isChipMaxed(chip({ level: CHIP_MAX_LEVEL, shardsForNextLevel: 30 }))).toBe(true);
    expect(isChipMaxed(chip({ level: 4, shardsForNextLevel: 0 }))).toBe(true);
    expect(isChipMaxed(chip({ level: 4 }))).toBe(false);
  });

  it('stays out of the ready set no matter how many shards are held', () => {
    const maxed = chip({ level: CHIP_MAX_LEVEL, shardsForNextLevel: 0 });
    expect(isChipReadyToLevelUp(maxed, shards(0))).toBe(false);
    expect(isChipReadyToLevelUp(maxed, shards(9_999))).toBe(false);
  });

  it('still reports a real candidate as ready, and a short one as not', () => {
    const lvl1 = chip({ level: 1, shardsForNextLevel: chipShardsForNextLevel(1) });
    expect(isChipReadyToLevelUp(lvl1, shards(chipShardsForNextLevel(1)))).toBe(true);
    expect(isChipReadyToLevelUp(lvl1, shards(chipShardsForNextLevel(1) - 1))).toBe(false);
  });

  it('does not let a maxed chip head the display order', () => {
    const maxed = chip({ id: 'maxed', level: CHIP_MAX_LEVEL, shardsForNextLevel: 0 });
    const payable = chip({
      id: 'payable',
      level: 1,
      shardsForNextLevel: chipShardsForNextLevel(1),
    });
    const order = sortChipsForDisplay([maxed, payable], shards(chipShardsForNextLevel(1)));
    expect(order[0].id).toBe('payable');
  });
});
