import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { resolveEngineConfig } from '@/hooks/useEngineConfig';
import { CHIP_MINT_SHARD_COST, QUALITY_TIERS } from '@/utils/global/inventory.utils';
import type { PublicConfig } from '@/types/interfaces/config.interfaces';

/**
 * The mint price is the admin's, not the bundle's.
 *
 * `inventory.service.mintChip` charges `platformConfig.engines.chipMintShardCost`,
 * which the panel edits per tier — while three screens quoted the bundled
 * `CHIP_MINT_SHARD_COST`. One edit in the panel and the Mint modal, the shard
 * sheet and the engine's empty-slot CTA all promised a price the server no
 * longer took, with no way for a client to learn the real one: `GET /config`
 * served every other engine knob and left this one out.
 *
 * Two halves, both pinned: the resolver must prefer what is served, and no
 * screen may go back to reading the constant directly.
 */

const served = (chipMintShardCost?: Record<string, number>): PublicConfig =>
  ({
    engines: {
      upgrade: {
        speedBase: 1,
        capacityBase: 2,
        perSubLevel: 1,
        perEngineLevel: 1,
        tierCostMultiplier: { bronze: 1 },
      },
      levelTables: {
        speedLevelBoostPct: [0],
        capacityLevelBonusTickets: [0],
        engineLevelSpeedBoostPct: [0],
        engineLevelBaseCapacity: [1],
      },
      chipMintShardCost,
    },
    // Only the `engines` section is under test; the rest of the payload is not
    // read by the resolver.
  }) as unknown as PublicConfig;

describe('chip mint price comes from the server', () => {
  it('prefers the served price over the bundled constant', () => {
    const { chipMintShardCost } = resolveEngineConfig(served({ bronze: 7, diamond: 44 }));
    expect(chipMintShardCost.bronze).toBe(7);
    expect(chipMintShardCost.diamond).toBe(44);
  });

  it('falls back per tier, so a partial map never blanks a price', () => {
    // The panel patches one tier at a time; the rest must keep a real number.
    const { chipMintShardCost } = resolveEngineConfig(served({ bronze: 7 }));
    expect(chipMintShardCost.bronze).toBe(7);
    for (const tier of QUALITY_TIERS.filter(q => q !== 'bronze')) {
      expect(chipMintShardCost[tier]).toBe(CHIP_MINT_SHARD_COST[tier]);
    }
  });

  it('falls back whole on a backend that does not serve the field, or no config yet', () => {
    expect(resolveEngineConfig(served(undefined)).chipMintShardCost).toEqual(CHIP_MINT_SHARD_COST);
    expect(resolveEngineConfig(undefined).chipMintShardCost).toEqual(CHIP_MINT_SHARD_COST);
  });
});

const SRC = resolve(process.cwd(), 'src');
/**
 * Where the constant legitimately lives: its own definition, the resolver that
 * falls back to it, and the mock backend — which stands in for the server and
 * therefore owns a price rather than quoting one.
 */
const ALLOWED = new Set([
  'src/utils/global/inventory.utils.ts',
  'src/hooks/useEngineConfig.ts',
  'src/mock/config.mock.ts',
  'src/mock/inventory.mock.ts',
]);

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name)) out.push(full);
  }
  return out;
};

describe('no screen quotes the bundled mint price', () => {
  it('imports CHIP_MINT_SHARD_COST only where it may be owned', () => {
    const offenders = walk(SRC)
      .filter(file => /\bCHIP_MINT_SHARD_COST\b/.test(readFileSync(file, 'utf8')))
      .map(file => relative(process.cwd(), file))
      .filter(file => !ALLOWED.has(file))
      // A comment naming the constant is documentation, not a quote.
      .filter(file => {
        const body = readFileSync(resolve(process.cwd(), file), 'utf8');
        return /CHIP_MINT_SHARD_COST\s*\[/.test(body) || /^\s*CHIP_MINT_SHARD_COST,/m.test(body);
      });
    expect(offenders).toEqual([]);
  });
});
