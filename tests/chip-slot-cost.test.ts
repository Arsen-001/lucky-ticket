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
 * Since 17.08.2026 attaching a chip is FREE and detaching costs the chip's
 * level in Lucky Stars; a move from engine A to engine B is a detach plus a
 * free attach, i.e. the level once. (Before: attach cost the level, detach half
 * of it, a move both — a player paid to USE a chip they had already earned.)
 * For a long while the app quoted prices and the backend charged NOTHING;
 * when the charge landed, screens quoted the wrong half. Both are the same
 * defect — a balance that drops by a number nobody showed the player — so the
 * formula is pinned here and diffed against the service that does the charging.
 */

const backendPath = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/inventory/inventory.service.ts'
);
const hasBackend = existsSync(backendPath);

const chip = (level: number, equippedOnEngineId?: string) => ({ level, equippedOnEngineId });

describe('chip slot prices (DOCS §10.4)', () => {
  it('attaching is free at every level', () => {
    expect(chipEquipStarsCost(1)).toBe(0);
    expect(chipEquipStarsCost(7)).toBe(0);
    expect(chipEquipStarsCost(10)).toBe(0);
  });

  it('detaching costs the chip level in Lucky Stars', () => {
    expect(chipUnequipStarsCost(1)).toBe(1);
    expect(chipUnequipStarsCost(7)).toBe(7);
    expect(chipUnequipStarsCost(10)).toBe(10);
  });

  it('a move is a detach plus a free attach', () => {
    // Lvl 7 off engine A onto engine B: 7 + 0.
    expect(chipSlotStarsCost(chip(7, 'engine-A'), 'engine-B')).toBe(7);
    // Never equipped — nothing to pay.
    expect(chipSlotStarsCost(chip(7), 'engine-B')).toBe(0);
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
    expect(source).toMatch(/equipStarsCost\s*=\s*\(\s*\)\s*=>\s*0/);
    expect(source).toMatch(
      /unequipStarsCost\s*=\s*\(\s*chipLevel[^)]*\)\s*=>\s*\n?\s*Math\.max\(1,\s*chipLevel\)/
    );
  });
});
