import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(process.cwd(), 'src/styles/global/base-layer.css'), 'utf8');
const declarations = css.replace(/\/\*[\s\S]*?\*\//g, '');

/** `@media (min-width: Npx) { :root { --engine-cube-scale: S } }`, in source order. */
const ladder = [
  ...declarations.matchAll(
    /@media\s*\(min-width:\s*(\d+)px\)\s*\{\s*:root\s*\{\s*--engine-cube-scale:\s*([\d.]+)/g
  ),
].map(match => ({ width: Number(match[1]), scale: Number(match[2]) }));

/** The face is painted 1.134x its footprint — see `--engine-cube-face-w`. */
const PERSPECTIVE_GAIN = 1.134;
const DESIGN_PX = 300;
/**
 * scale(1) is defined at the app column's own max width, so every real screen
 * scales down. Raising this number shrinks the cube — and with it every piece of
 * type on the front face, which is laid out once and only scaled.
 */
const REFERENCE_PX = 454;
/** `--app-max-w` — the app stops widening here, so the ladder does too. */
const COLUMN_PX = 430;

describe('engine cube scale', () => {
  /**
   * The home cube is laid out at one design square and scaled to fit. Getting
   * that scale used to mean dividing one CSS length by another, for which the
   * known trick is `tan(atan2(a, b))` — and WebKit evaluates it in RADIANS:
   * tan(45rad) = 1.6198 where the answer is tan(45deg) = 1. That shipped a
   * 486px cube into a 300px slot on every iPhone in Telegram. `@supports
   * (scale: tan(atan2(1px, 1px)))` does NOT gate it — WebKit parses the
   * expression happily and only the value is wrong, so Chromium (and every
   * desktop check) sees nothing.
   */
  it('never divides lengths with CSS trig', () => {
    expect(declarations).not.toMatch(/atan2|\btan\(/);
  });

  it('derives the footprint from the scale so the two cannot disagree', () => {
    expect(declarations).toMatch(
      /--engine-cube-box:\s*calc\(var\(--engine-cube-design\)\s*\*\s*var\(--engine-cube-scale\)\)/
    );
  });

  it('rises with viewport width and never enlarges', () => {
    expect(ladder.length).toBeGreaterThan(5);
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i].width).toBeGreaterThan(ladder[i - 1].width);
      expect(ladder[i].scale).toBeGreaterThanOrEqual(ladder[i - 1].scale);
    }
    // scale(1) lives at the reference width, which no real screen reaches, so
    // the cube is only ever shrunk. Enlarging is how it read as oversized.
    for (const { scale } of ladder) expect(scale).toBeLessThanOrEqual(1);
  });

  /**
   * The promise the ladder exists to keep: the cube takes the SAME share of the
   * screen on every phone. Each rung is its own width over the reference, until
   * the app column stops widening and the cube stops with it.
   */
  it('gives every rung the same share of its own width', () => {
    for (const { width, scale } of ladder) {
      expect(scale, `rung at ${width}px`).toBeCloseTo(Math.min(width, COLUMN_PX) / REFERENCE_PX, 3);
    }
  });

  it('keeps the painted face inside the narrowest viewport each rung serves', () => {
    // A rung applies from its own min-width upward, so the tightest case is
    // exactly at that width. If the face does not fit there, it never fits.
    for (const { width, scale } of ladder) {
      expect(scale).toBeGreaterThan(0);
      expect(scale).toBeLessThanOrEqual(1);
      expect(DESIGN_PX * scale * PERSPECTIVE_GAIN).toBeLessThanOrEqual(width);
    }
  });
});
