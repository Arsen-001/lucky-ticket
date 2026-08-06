import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const ENTRY = 'src/styles/index.css';

const cssFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return cssFiles(path);
    return entry.name.endsWith('.css') ? [path] : [];
  });

const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
const entry = read(ENTRY);

/** Files the Tailwind entry pulls in itself — `@utility` compiles there. */
const importedByEntry = new Set(
  [...entry.matchAll(/@import\s+'\.\/([^']+)'/g)].map(m => `src/styles/${m[1]}`)
);

describe('tailwind @utility declarations', () => {
  /**
   * `@utility` only compiles in a file Tailwind actually processes: one the
   * entry (`styles/index.css`) imports, or one that pulls in `tailwindcss`
   * itself. Anywhere else it does NOT fail the build — the raw at-rule ships
   * into the bundle and the browser silently drops it as unknown.
   *
   * That is exactly how two of them died in production: `gift-glow` (the
   * pre-launch gift) and `engine-bottom-shine-pulse` (the engine card). Both
   * classes were on real elements, both `@keyframes` shipped, and the built CSS
   * literally contained `@utility gift-glow{animation:…}`. Nothing failed —
   * next 16.1.5's bundler said nothing, the type-check passed, every e2e was
   * green. It surfaced only because a Next bump started printing a parse
   * warning about it.
   */
  it('every file declaring @utility is one Tailwind compiles', () => {
    const orphans = cssFiles('src/styles')
      .filter(path => path !== ENTRY)
      .filter(path => /@utility\s/.test(read(path)))
      .filter(path => !importedByEntry.has(path) && !/@import\s+'tailwindcss'/.test(read(path)));

    expect(
      orphans,
      `these declare @utility but Tailwind never sees them — add \`@import 'tailwindcss';\` ` +
        `at the top, or import the file from ${ENTRY}`
    ).toEqual([]);
  });

  /**
   * `@utility` has to sit at the top level. A second one wrapped in `@media` to
   * "override" the first is not an override — it is a rule the compiler cannot
   * place, which is what the reduced-motion variant of `gift-glow` was. Put the
   * `@media` INSIDE the utility body instead.
   */
  it('never nests @utility inside another at-rule', () => {
    const nested = cssFiles('src/styles').filter(path =>
      // An @utility that is indented sits inside something else.
      /^[ \t]+@utility\s/m.test(read(path))
    );

    expect(nested, 'move the @media inside the @utility body, not the other way round').toEqual([]);
  });
});
