import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * An `<Image>` that states neither `width` nor `sizes` orders the biggest
 * variant of itself.
 *
 * `next/image` needs some idea of how wide the picture will be drawn. Given
 * `width`, it builds a srcset around that number and everything is fine. Given
 * neither, it falls back to the file's OWN dimensions and asks for one and two
 * times them — so a 512px source painted into a 24px button downloads the
 * 1080px variant.
 *
 * Measured on this repo (12.08.2026) before the fix:
 *   Google button   32.7 KB served where 1.1 KB was needed
 *   Telegram star   39.3 KB served where 1.1 KB was needed
 *   Wordmark logo   95.6 KB served where 19.1 KB was needed on a 1x screen
 * — about 170 KB of avoidable transfer in a mobile app, and none of it visible
 * to any existing check: the picture looks perfect, it is merely enormous.
 * `fill` has the same hole from the other side — its default `sizes` is `100vw`,
 * so it asks for a full-viewport variant of a thumbnail.
 *
 * So the rule: every `<Image>` says `width`, or `sizes`, or explicitly opts out
 * of the optimizer with `unoptimized` (the SVG flag guarded elsewhere).
 */
const TSX_ROOT = new URL('../src', import.meta.url).pathname;

const tsxFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return tsxFiles(full);
    return entry.name.endsWith('.tsx') ? [full] : [];
  });

describe('every optimized image says how wide it will be drawn', () => {
  it('has no <Image> left guessing', () => {
    const offenders: string[] = [];

    for (const file of tsxFiles(TSX_ROOT)) {
      const source = readFileSync(file, 'utf8');
      if (!source.includes("from 'next/image'")) continue;

      for (const match of source.matchAll(/<Image\b[\s\S]*?\/>/g)) {
        const tag = match[0];
        if (/\bsizes=/.test(tag) || /\bunoptimized\b/.test(tag)) continue;
        // `width` bounds the srcset by itself; `fill` does not — it defaults to
        // the whole viewport and needs `sizes` to mean anything smaller.
        if (/\bwidth=/.test(tag) && !/\bfill\b/.test(tag)) continue;

        const line = source.slice(0, match.index).split('\n').length;
        offenders.push(`${path.relative(TSX_ROOT, file)}:${line}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
