import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const tsxFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return tsxFiles(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });

/** Where `Modal` / `BottomSheet` are declared — they receive `label`, not pass it. */
const DEFINITIONS = [
  'src/components/shared/modals/Modal.tsx',
  'src/components/shared/modals/BottomSheet.tsx',
];

/**
 * Slices out the opening tag (`<Modal … >`) for every usage of `tag`, tracking
 * brace depth so a `>` inside an expression prop (`onClose={() => …}`) doesn't
 * end the tag early.
 */
const openingTags = (source: string, tag: string): string[] => {
  const tags: string[] = [];
  const pattern = new RegExp(`<${tag}(?=[\\s/>])`, 'g');
  for (let match = pattern.exec(source); match; match = pattern.exec(source)) {
    let depth = 0;
    let i = match.index;
    for (; i < source.length; i++) {
      const char = source[i];
      if (char === '{') depth++;
      else if (char === '}') depth--;
      else if (char === '>' && depth === 0) break;
    }
    tags.push(source.slice(match.index, i));
  }
  return tags;
};

const usages = (tag: string) =>
  tsxFiles('src')
    .filter(file => !DEFINITIONS.includes(file))
    .flatMap(file =>
      openingTags(readFileSync(resolve(root, file), 'utf8'), tag).map(text => ({ file, text }))
    );

describe('dialogs name themselves', () => {
  /**
   * A dialog with no accessible name is announced as just "dialog" — the player
   * hears that something opened and nothing about what. `Modal` and
   * `BottomSheet` both take `label` and put it on `aria-label`; every call site
   * has to pass it, because the component cannot invent a name for itself.
   *
   * The one automatic exception is `ConfirmModal`, which derives the label from
   * its own `title` (see its `typeof title === 'string'` guard) — that is why
   * `ConfirmModal` call sites are not swept here.
   */
  it.each(['Modal', 'BottomSheet'])('every <%s> call site passes label', tag => {
    const unnamed = usages(tag)
      .filter(({ text }) => !/\blabel=/.test(text))
      .map(({ file }) => file);

    expect(unnamed).toEqual([]);
  });

  /**
   * Without this, the sweep above passes whether the codebase is clean or the
   * tag matcher simply stopped matching — a green test proving nothing.
   */
  it('actually finds the call sites it sweeps', () => {
    expect(usages('Modal').length).toBeGreaterThan(30);
    expect(usages('BottomSheet').length).toBeGreaterThan(0);
  });

  it('recognises the shape it is meant to forbid', () => {
    const source = '<Modal open={open} onClose={() => close()}>x</Modal>';
    expect(openingTags(source, 'Modal')).toEqual(['<Modal open={open} onClose={() => close()}']);
    expect(/\blabel=/.test(openingTags(source, 'Modal')[0])).toBe(false);
  });

  it('keeps the label wired to aria-label in both surfaces', () => {
    for (const definition of DEFINITIONS) {
      expect(readFileSync(resolve(root, definition), 'utf8')).toContain('aria-label={label}');
    }
  });
});
