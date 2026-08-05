import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { MAX_STAGGER_MS, staggerMs, staggerStyle } from '@/utils/global/animation.utils';

const root = process.cwd();

const tsxFiles = (dir: string): string[] =>
  readdirSync(resolve(root, dir), { withFileTypes: true }).flatMap(entry => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return tsxFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });

describe('entry-animation stagger', () => {
  /**
   * `animate-slide-in-bottom` is declared with `fill-mode: both`, so an item
   * holds `opacity: 0` for the whole of its delay. An unclamped `index * step`
   * therefore does not stagger a long list — it hides its tail. Caught on the
   * paginated notifications feed, where the last screenful of 48 rows was still
   * blank four seconds after loading; the leaderboard (100 rows) and the
   * transaction histories were running the same arithmetic.
   */
  it('never delays an item past the ceiling, at any step or index', () => {
    for (const step of [30, 50, 60, 80, 90, 100])
      for (const index of [0, 5, 20, 100, 5000])
        expect(staggerMs(index, step)).toBeLessThanOrEqual(MAX_STAGGER_MS);
  });

  it('still staggers the first screenful', () => {
    expect(staggerMs(0)).toBe(0);
    expect(staggerMs(1)).toBeGreaterThan(0);
    expect(staggerMs(3)).toBeGreaterThan(staggerMs(1));
  });

  it('leaves a short list exactly as it was', () => {
    // A five-item tab bar at the 100ms step must not change appearance.
    expect([0, 1, 2, 3, 4].map(i => staggerMs(i, 100))).toEqual([0, 100, 200, 300, 400]);
  });

  it('treats a negative index as the first item rather than a negative delay', () => {
    expect(staggerMs(-5)).toBe(0);
  });

  it('renders a ready-to-spread style object', () => {
    expect(staggerStyle(2, 50)).toEqual({ animationDelay: '100ms' });
  });

  /**
   * The failure mode is invisible in review — `index * 60` looks like every
   * other stagger in the codebase and only misbehaves once a list grows. So the
   * rule is enforced rather than remembered.
   */
  // `${...}s` (seconds) values are keyframe choreography — particles, sparkles,
  // a negative offset seeding a progress bar — not list entry staggers.
  const rawDelay = () => /animationDelay:\s*`\$\{[^`]*\*[^`]*\}ms`/g;

  it('recognises the shape it is meant to forbid', () => {
    // Without this the sweep below passes whether the codebase is clean or the
    // pattern simply stopped matching — a green test proving nothing.
    expect('style={{ animationDelay: `${index * 60}ms` }}').toMatch(rawDelay());
    expect('animationDelay: `${Math.min(index, 8) * 50}ms`').toMatch(rawDelay());
    expect('animationDelay: `${staggerMs(index, 60)}ms`').not.toMatch(rawDelay());
  });

  it('has no raw index-multiplied delay left in the app', () => {
    const offenders: string[] = [];

    for (const file of tsxFiles('src')) {
      if (file.endsWith('animation.utils.ts')) continue;
      for (const hit of readFileSync(resolve(root, file), 'utf8').match(rawDelay()) ?? [])
        offenders.push(`${file} — ${hit}`);
    }

    expect(offenders).toEqual([]);
  });
});
