import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * `bolt.webp` was 431 KB — a lossless 510×915 sheet behind an icon that is never
 * drawn wider than 47 CSS px. The 12.08.2026 asset pass could not shrink it: it
 * only tried re-encoding at full size, and every lossy setting moved the served
 * pixels further than the optimizer's own q=75 loss (2.2/255 against a 1.03
 * budget at w=32). Downscaling instead of re-quantizing costs almost nothing —
 * the source went to 256×459, still lossless, 126 KB, and the served output at
 * every width the app can ask for stays inside that same budget (measured
 * premultiplied: 0.63 · 0.81 · 0.75 · 1.05 · 0.20 against 1.03 · 1.14 · 1.15 ·
 * 1.08 · 0.81). Players never paid for those bytes — the optimizer always
 * resized — the server did, on every cold request.
 *
 * That trade has one edge, and this test guards it. The image optimizer runs
 * with `withoutEnlargement: true`, so it can never give back more pixels than
 * the source holds: a call site bigger than today's biggest would silently be
 * served a 256px image stretched, and it would look soft rather than broken —
 * nothing else in the suite would notice.
 *
 * The demand is computed, not assumed: the bolt is portrait inside a square box
 * under `object-contain`, so it renders `size × (width / height)` CSS px wide,
 * and a screen asks for that times its pixel ratio. DPR 4 is the ceiling any
 * shipping phone reports.
 */
const ASSET = new URL('../public/assets/icons/ui/bolt.webp', import.meta.url).pathname;
const SRC_ROOT = new URL('../src', import.meta.url).pathname;
const MAX_DPR = 4;

/** Intrinsic size straight out of the VP8L header — no image library needed. */
const readLosslessWebpSize = (file: string) => {
  const bytes = readFileSync(file);
  expect(bytes.toString('ascii', 12, 16)).toBe('VP8L');
  const packed = bytes.readUInt32LE(21);
  return { width: (packed & 0x3fff) + 1, height: ((packed >>> 14) & 0x3fff) + 1 };
};

const tsxFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return tsxFiles(full);
    return entry.name.endsWith('.tsx') ? [full] : [];
  });

describe('the bolt source covers every size it is drawn at', () => {
  it('holds enough pixels for the widest call site at DPR 4', () => {
    const { width, height } = readLosslessWebpSize(ASSET);
    const aspect = width / height;

    // Literal sizes only. The two computed ones (`iconSize + BOLT_BONUS`,
    // `cfg.icon + 6`) resolve to 25 and 22 today — well under the literals, and
    // a static scan cannot evaluate them anyway.
    const callSites: { where: string; size: number }[] = [];
    for (const file of tsxFiles(SRC_ROOT)) {
      const source = readFileSync(file, 'utf8');
      if (!source.includes('BoltIcon')) continue;

      for (const match of source.matchAll(/<BoltIcon\b[^>]*?\bsize=\{(\d+)\}/g)) {
        callSites.push({
          where: `${path.relative(SRC_ROOT, file)}:${source.slice(0, match.index).split('\n').length}`,
          size: Number(match[1]),
        });
      }
    }

    // A scan that finds nothing would pass forever; the icon is used ~25 times.
    expect(callSites.length).toBeGreaterThan(10);

    const tooBig = callSites.filter(site => site.size * aspect * MAX_DPR > width);
    expect(tooBig).toEqual([]);
  });
});
