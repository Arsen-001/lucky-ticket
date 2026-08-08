import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

const sourceFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });

const UTILITIES = 'src/styles/global/utilities.css';

/**
 * Comments are dropped first: a prose mention of `tap-target` in backticks
 * reads as a one-class string to the matcher below, and a doc comment is not a
 * call site. Whole-line comments only, so a `https://…` inside a string stays
 * intact.
 */
const withoutComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !/^\s*(\/\/|\*)/.test(line))
    .join('\n');

/** `class="… tap-target …"` occurrences, with the whole class string kept. */
const tapTargetClassStrings = (source: string): string[] =>
  [...withoutComments(source).matchAll(/(["'`])((?:(?!\1).)*\btap-target\b(?:(?!\1).)*)\1/g)].map(
    m => m[2]
  );

const usages = () =>
  sourceFiles('src').flatMap(file =>
    tapTargetClassStrings(readFileSync(resolve(root, file), 'utf8')).map(classes => ({
      file,
      classes,
    }))
  );

describe('tap-target hit zones', () => {
  it('is declared as a utility', () => {
    expect(readFileSync(resolve(root, UTILITIES), 'utf8')).toMatch(/@utility tap-target \{/);
  });

  /**
   * The zone is an absolutely positioned `::after`, so it anchors to the
   * nearest POSITIONED ancestor. On a static control that ancestor is some
   * outer container and the 44×44 square lands somewhere else on the screen —
   * silently, because nothing looks different either way.
   *
   * `position` is not baked into the utility on purpose: it would then fight
   * the `absolute` that controls like the avatar edit badge already carry, and
   * the winner would come down to stylesheet order.
   */
  it('every control that uses it is positioned', () => {
    const unpositioned = usages()
      .filter(({ classes }) => !/\b(relative|absolute|fixed|sticky)\b/.test(classes))
      .map(({ file }) => file);

    expect(unpositioned).toEqual([]);
  });

  it('recognises the shape it is meant to forbid', () => {
    // Positive control: the sweep must reject a class string with no position.
    const bad = tapTargetClassStrings('className="tap-target flex-center h-7 w-7"');
    expect(bad).toHaveLength(1);
    expect(/\b(relative|absolute|fixed|sticky)\b/.test(bad[0])).toBe(false);
  });

  it('actually finds the call sites it sweeps', () => {
    expect(usages().length).toBeGreaterThan(5);
  });
});
