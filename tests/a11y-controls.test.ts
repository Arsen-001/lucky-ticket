import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Controls whose state is only a colour.
 *
 * `Switch` rendered a bare `<button>`: the on/off state lived in a background
 * gradient and a knob position, with no role, no `aria-checked` and no name. It
 * looked perfect and told assistive tech nothing — and `getByRole('switch')`
 * found zero switches, so no test could have noticed either.
 */

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

const tsxFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return tsxFiles(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });

describe('switch accessibility', () => {
  it('the Switch reports itself as a switch, with its state', () => {
    const source = read('src/components/shared/form-elements/Switch.tsx');
    expect(source).toMatch(/role="switch"/);
    expect(source).toMatch(/aria-checked=\{isChecked\}/);
  });

  it('every Switch is given a name', () => {
    // A switch announced as "switch, on" and nothing else says what it controls.
    // The label is always at hand — the settings row it sits in has one.
    const unnamed: string[] = [];

    for (const file of tsxFiles('src')) {
      if (file.endsWith('Switch.tsx')) continue;
      const source = read(file);
      for (const element of source.match(/<Switch\b[\s\S]*?\/>/g) ?? []) {
        if (!/aria-label(?:ledby)?=/.test(element)) {
          unnamed.push(`${file} — <Switch> without an aria-label`);
        }
      }
    }

    expect(unnamed).toEqual([]);
  });
});

describe('overlay semantics', () => {
  const overlays = ['Modal', 'BottomSheet'] as const;

  it.each(overlays)('%s announces itself as a dialog', name => {
    // Measured on a running build: every sheet and modal was an anonymous div.
    // Nothing told a screen reader a dialog had opened.
    const source = read(`src/components/shared/modals/${name}.tsx`);
    expect(source).toMatch(/role="dialog"/);
    expect(source).toMatch(/aria-modal="true"/);
    expect(source).toMatch(/aria-label=\{label\}/);
  });

  it.each(overlays)('%s traps focus and locks the page behind it', name => {
    // An open overlay left 20–103 focusable controls live behind it, and the
    // first Tab landed on the page underneath. The lock also stops the page
    // scrolling behind a sheet.
    const source = read(`src/components/shared/modals/${name}.tsx`);
    expect(source).toMatch(/useOverlayFocusLock\(open\)/);
    expect(source).toMatch(/ref=\{panelRef\}/);
  });

  it('the focus lock keys on the node, not just the open flag', () => {
    // The panel lives inside a ClientPortal and arrives a render late. Keyed on
    // `open` alone the effect ran against an empty ref and never ran again —
    // present, reviewed, and doing nothing.
    const source = read('src/hooks/useOverlayFocusLock.ts');
    expect(source).toMatch(/\}, \[open, panel\]\);/);
    expect(source).toMatch(/document\.body\.style\.overflow = 'hidden'/);
  });
});
