import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  chipEquipStarsCost,
  chipSlotStarsCost,
  chipUnequipStarsCost,
} from '@/utils/global/inventory.utils';

/**
 * Chip slot prices — what the screen promises must be what the server takes.
 *
 * DOCS §10.4 fixes three numbers: attach costs the chip's level, detach costs
 * `ceil(level / 2)`, and a move from engine A to engine B pays both. For a long
 * while the app quoted all three and the backend charged NOTHING (chips moved
 * around the fleet for free); when the charge landed, two screens were still
 * quoting the attach price for a detach and none of them priced a move at all.
 * Both halves of that are the same defect — a balance that drops by a number
 * nobody showed the player — so the formula is pinned here on the DOCS examples
 * and diffed against the service that does the charging.
 */

const backendPath = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/inventory/inventory.service.ts'
);
const hasBackend = existsSync(backendPath);

const chip = (level: number, equippedOnEngineId?: string) => ({ level, equippedOnEngineId });

describe('chip slot prices (DOCS §10.4)', () => {
  it('attach costs the chip level in Lucky Stars', () => {
    expect(chipEquipStarsCost(1)).toBe(1);
    expect(chipEquipStarsCost(12)).toBe(12);
    expect(chipEquipStarsCost(200)).toBe(200);
  });

  it('detach costs half of that, rounded up', () => {
    expect(chipUnequipStarsCost(1)).toBe(1);
    expect(chipUnequipStarsCost(11)).toBe(6);
    expect(chipUnequipStarsCost(12)).toBe(6);
    expect(chipUnequipStarsCost(200)).toBe(100);
  });

  it('a move pays the detach on top of the attach', () => {
    // Lvl 12 off engine A onto engine B: 12 + 6.
    expect(chipSlotStarsCost(chip(12, 'engine-A'), 'engine-B')).toBe(18);
    // Never equipped — attach only.
    expect(chipSlotStarsCost(chip(12), 'engine-B')).toBe(12);
  });

  it('charges nothing for an equip that moves nothing', () => {
    // The picker lists a chip already in this slot; the server no-ops on it, so
    // the screen must not quote a price for it either.
    expect(chipSlotStarsCost(chip(12, 'engine-B'), 'engine-B')).toBe(0);
  });
});

describe.skipIf(!hasBackend)('backend ↔ frontend chip price parity', () => {
  it('inventory.service.ts uses the same two formulas', () => {
    const source = readFileSync(backendPath, 'utf8');
    // Both sides compute the price independently — the app to quote it, the
    // service to take it — so drift is silent until a player is overcharged.
    expect(source).toMatch(
      /equipStarsCost\s*=\s*\(\s*chipLevel[^)]*\)\s*=>\s*Math\.max\(1,\s*chipLevel\)/
    );
    expect(source).toMatch(
      /unequipStarsCost\s*=\s*\(\s*chipLevel[^)]*\)\s*=>\s*\n?\s*Math\.max\(1,\s*Math\.ceil\(chipLevel\s*\/\s*2\)\)/
    );
  });
});
