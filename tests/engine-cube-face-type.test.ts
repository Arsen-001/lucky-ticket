import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * The home cube's front face is the `compact` branch of the engine card. It is
 * laid out once inside a 300px design square and the whole square is then
 * SCALED to the cube's footprint, so a size written here is not the size the
 * player sees: on-screen size = declared size x `--engine-cube-scale`.
 *
 * That multiplier is why this guard exists. The face was twice sized as if
 * "compact" meant "small" — 8-12px declared, which arrived as 7.4-9.8px on a
 * 390px phone — and twice had to be enlarged by hand. The floor below is the
 * declared size that still reads at the tightest rung, and it is deliberately
 * LARGER than the full-size card's type, which is not scaled at all.
 */
const FACE_FILES = [
  'src/components/pages/out-tabs/tabs-extra/ticket/EngineCardStatsHeader.tsx',
  'src/components/pages/out-tabs/tabs-extra/ticket/EngineCardCycleRow.tsx',
  'src/components/pages/out-tabs/tabs-extra/ticket/BoostRow.tsx',
];

/** Declared px in the compact branch. Below this the face stops being readable. */
const MIN_COMPACT_PX = 13;

/**
 * `compact ? 'text-[Npx]…' : …` — the ternary is how every one of these files
 * picks the face's type, so reading the true branch reads the face.
 */
const COMPACT_TYPE = /compact\s*\?\s*'([^']*\btext-\[(\d+)px\][^']*)'/g;

function compactSizes(file: string) {
  const source = readFileSync(resolve(process.cwd(), file), 'utf8');
  return [...source.matchAll(COMPACT_TYPE)].map(match => ({
    px: Number(match[2]),
    snippet: match[1],
  }));
}

describe('home cube front face type', () => {
  it('finds the sizes it claims to check', () => {
    // Without this the whole suite passes on a renamed prop or a refactor to
    // twMerge maps — an empty scan is indistinguishable from a clean one.
    const total = FACE_FILES.reduce((sum, file) => sum + compactSizes(file).length, 0);
    expect(total).toBeGreaterThanOrEqual(6);
  });

  it.each(FACE_FILES)('%s never declares face type below the floor', file => {
    for (const { px, snippet } of compactSizes(file)) {
      expect(px, `"${snippet}" in ${file}`).toBeGreaterThanOrEqual(MIN_COMPACT_PX);
    }
  });

  it('keeps the scale that makes those sizes land where they were measured', () => {
    // The floor above is only meaningful against a known scale: raising the
    // reference shrinks every one of these sizes without touching this file.
    const css = readFileSync(resolve(process.cwd(), 'src/styles/global/base-layer.css'), 'utf8');
    const reference = Number(css.match(/--engine-cube-reference:\s*(\d+)px/)?.[1]);
    expect(reference).toBeLessThanOrEqual(430);
  });
});
