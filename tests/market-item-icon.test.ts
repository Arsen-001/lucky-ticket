import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const MARKET_DIR = 'src/components/pages/tabs/market';

const sourceFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });

const read = (file: string) => readFileSync(resolve(root, file), 'utf8');

/** Whole-line comments only — the prose below documents the very patterns it bans. */
const withoutComments = (source: string): string =>
  source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !/^\s*(\/\/|\*)/.test(line))
    .join('\n');

/**
 * A market item hands over a PAINTER, not a picture.
 *
 * The three market dialogs each have a different amount of room (156px stage,
 * 64px confirm row, 44px receipt line). When they were handed a node already
 * sized at 140–165px they boxed it down with `[&>*]:size-full!`, which resizes
 * the element but not what it draws — a gift's emoji kept its 99px glyph and
 * `overflow-hidden` cut the bear's ears off, three reports in a row, while
 * every image-based item looked fine.
 *
 * `e2e/market-modal-art.spec.ts` measures the real screens; this test guards the
 * shape that made the geometry correct, so the pattern cannot creep back in a
 * pull request that never runs the browser suite.
 */
describe('market items render their art at the size each surface asks for', () => {
  it('the selected-item contract is a size-taking renderer, not a ready-made node', () => {
    const view = read(`${MARKET_DIR}/MarketView.tsx`);
    expect(view).toMatch(/renderIcon:\s*\(size:\s*number\)\s*=>\s*ReactNode/);
    expect(withoutComments(view)).not.toMatch(/\biconNode\b/);
  });

  it('every dialog asks for a concrete pixel size', () => {
    const surfaces: [string, RegExp][] = [
      [`${MARKET_DIR}/MarketInfoModal.tsx`, /renderIcon\(\d+\)/],
      [`${MARKET_DIR}/MarketPurchaseModal.tsx`, /renderIcon\(\d+\)/],
      [`${MARKET_DIR}/MarketPurchaseSuccessModal.tsx`, /renderItemIcon\(\d+\)/],
    ];
    for (const [file, call] of surfaces) {
      expect(withoutComments(read(file)), `${file} must request its own icon size`).toMatch(call);
    }
  });

  it('no market surface resizes a picture from the outside', () => {
    const offenders = sourceFiles(MARKET_DIR)
      .filter(file => /size-full!|\[&>\*\]:size-/.test(withoutComments(read(file))))
      .map(file => `${file} forces a size onto a child instead of requesting it`);
    expect(offenders).toEqual([]);
  });

  it('every section builds its item with a renderer', () => {
    const sections = sourceFiles(`${MARKET_DIR}/sections`).filter(file =>
      /Section\.tsx$/.test(file)
    );
    expect(sections.length).toBeGreaterThan(3);
    for (const file of sections) {
      const source = withoutComments(read(file));
      if (!/\bprices:\s/.test(source)) continue; // not an item builder
      expect(source, `${file} must hand over renderIcon`).toMatch(/\brenderIcon\b/);
      expect(source, `${file} must not hand over a pre-sized node`).not.toMatch(/\biconNode\b/);
    }
  });
});
