import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Both home carousels let a neighbouring card peek from behind the active one,
 * and both hide the slice with a mask that fades the app column's edges.
 *
 * The mask only works if its ramp is EASED. With a straight
 * `transparent → black` ramp the alpha is already ~80% halfway across the gap —
 * and the peek lives entirely inside that gap, so the neighbour's rows stay
 * legible, and legibly sliced by the screen border. That reads as content
 * crawling out from under the active card, which is the bug both masks exist to
 * prevent.
 *
 * It has been fixed twice from scratch: the tournaments carousel got the eased
 * ramp in `1215e98` ("спад не линейный: при прямой рампе сосед остаётся
 * читаемым"), and the engines slider — the older of the two — kept its linear
 * one until a player photographed «Скорость» / «Вместимость» sticking out past
 * the cube. Measured on a 390px phone before the fix: luminance spread 51/255
 * (sd 10.3) across the 46px strip, i.e. text-grade contrast; after: 33 (sd 6.8),
 * with no glyph readable.
 *
 * So this guard is not about the exact stops — tune those freely — but about
 * the ramp never collapsing back to two ends and no middle.
 */
const MASKS = [
  {
    file: 'src/styles/components/home-engines-slider.css',
    selector: '.engines-slider-edge-fade',
  },
  {
    file: 'src/styles/components/home-tournament-ticket.css',
    selector: '.home-tournament-rail',
  },
] as const;

/**
 * The `mask-image` of ONE rule — the standard property, not the -webkit- alias.
 * Scoped to the selector's own block on purpose: the ticket rail's file also
 * carries the punch-hole mask, and a file-wide search reads that one instead.
 */
function maskGradient(source: string, selector: string) {
  const block = source.slice(source.indexOf(`${selector} {`));
  const rule = block.slice(0, block.indexOf('\n}'));
  const at = rule.indexOf('\n  mask-image:');
  if (at < 0) return null;
  const tail = rule.slice(at);
  const end = tail.indexOf(');');
  return end < 0 ? null : tail.slice(0, end + 1);
}

describe('home carousel edge masks', () => {
  it.each(MASKS)('$selector exists and is masked', ({ file, selector }) => {
    const source = readFileSync(resolve(process.cwd(), file), 'utf8');
    expect(source, `${selector} is gone from ${file}`).toContain(selector);
    // Without this the assertions below pass vacuously on a renamed property.
    expect(maskGradient(source, selector), `no mask-image on ${selector}`).not.toBeNull();
  });

  it.each(MASKS)(
    '$selector ramps through a partial stop, not straight to opaque',
    ({ file, selector }) => {
      const source = readFileSync(resolve(process.cwd(), file), 'utf8');
      const gradient = maskGradient(source, selector) ?? '';

      // A partially transparent stop between the two ends is the whole
      // mechanism: `rgb(0 0 0 / N%)` at some fraction of the gap.
      const partial = [...gradient.matchAll(/rgb\(\s*0\s+0\s+0\s*\/\s*(\d+)%\s*\)/g)].map(m =>
        Number(m[1])
      );

      expect(partial.length, `only a linear ramp in ${file}: ${gradient}`).toBeGreaterThanOrEqual(
        2
      );
      // Every intermediate stop has to actually hold the neighbour down. A stop
      // at 60% would satisfy "not linear" while hiding nothing.
      for (const alpha of partial)
        expect(
          alpha,
          `intermediate stop at ${alpha}% is too bright in ${file}`
        ).toBeLessThanOrEqual(35);
    }
  );

  it('the engines ramp is derived from the painted face, not a fixed pixel count', () => {
    // A constant ramp is right on exactly one phone. The gap beside the cube is
    // a function of the painted face width, which is a function of the scale
    // ladder — so the mask has to read the same variable the cube does.
    const source = readFileSync(
      resolve(process.cwd(), 'src/styles/components/home-engines-slider.css'),
      'utf8'
    );
    expect(source).toContain('var(--engine-cube-edge-fade)');
  });

  it('the cube face rail is offset by the perspective overhang, not a constant', () => {
    // Same class of bug, one element over: the rail is positioned against the
    // un-scaled footprint while the face is painted 1.134x wider, so `-9px`
    // ("just outside the card") landed 8px inside it. e2e/layout-invariants
    // measures the result; this catches the regression in the source.
    const source = readFileSync(
      resolve(process.cwd(), 'src/styles/components/engine-cube-face-pips.css'),
      'utf8'
    );
    const rule = source.slice(source.indexOf('.engine-cube-face-pips {'));
    const right = rule.match(/\n\s*right:\s*([^;]+);/)?.[1] ?? '';
    expect(right, 'no right offset on the rail').not.toBe('');
    expect(right, `rail offset "${right}" ignores the painted face width`).toContain(
      '--engine-cube-face-w'
    );
  });
});
