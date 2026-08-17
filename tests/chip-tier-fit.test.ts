import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { QUALITY_TIERS, canEquipChipOnTier, tierRank } from '@/utils/global/inventory.utils';

/**
 * Chips work DOWN the tier ladder (DOCS §10.4), boosters do not (§10.6).
 *
 * The app enforced the booster rule on chips — `chipQuality === engineTier` —
 * for three months, which is strictly harsher than the server has ever been.
 * It cost exactly the chips worth the most: a Diamond chip is the one that
 * fits every engine, and a player holding one without a Diamond engine was
 * told "no engines available" and could not use it at all.
 *
 * The matrix below is the one written out in DOCS §10.4, tier by tier.
 */

describe('a chip fits its own tier or lower (DOCS §10.4)', () => {
  it('matches the documented matrix', () => {
    // Bronze chip → Bronze only … Diamond chip → anything.
    for (const chip of QUALITY_TIERS) {
      for (const engine of QUALITY_TIERS) {
        expect(canEquipChipOnTier(chip, engine), `${chip} chip on ${engine} engine`).toBe(
          tierRank(engine) <= tierRank(chip)
        );
      }
    }
  });

  it('spells out the two ends', () => {
    expect(canEquipChipOnTier('diamond', 'bronze')).toBe(true);
    expect(canEquipChipOnTier('diamond', 'diamond')).toBe(true);
    expect(canEquipChipOnTier('bronze', 'bronze')).toBe(true);
    expect(canEquipChipOnTier('bronze', 'silver')).toBe(false);
    expect(canEquipChipOnTier('gold', 'platinum')).toBe(false);
    expect(canEquipChipOnTier('gold', 'silver')).toBe(true);
  });
});

const backendPath = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/inventory/inventory.service.ts'
);

describe.skipIf(!existsSync(backendPath))('backend ↔ frontend tier rule parity', () => {
  it('the service refuses on the same comparison', () => {
    const source = readFileSync(backendPath, 'utf8');
    // `equipChip` throws when the ENGINE outranks the CHIP — the same direction
    // as `tierRank(engineTier) <= tierRank(chipQuality)` above. A server that
    // flipped this to `!==` would make every screen quote a fit it cannot have.
    expect(source).toMatch(/TIER_RANK\[engine\.tier\]\s*>\s*TIER_RANK\[chip\.quality\]/);
  });

  it('boosters stay strictly tier-locked, and that is a different rule', () => {
    const source = readFileSync(backendPath, 'utf8');
    expect(source).toMatch(/booster\.quality\s*!==\s*engine\.tier/);
  });
});
