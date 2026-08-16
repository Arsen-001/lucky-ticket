import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * Every screen that computes an engine's cycle must feed it the SAME inputs.
 *
 * Since «one ticket = one tier cycle» (16.08.2026) the cycle is capacity ×
 * base ÷ speed — so a capacity chip or booster lengthens it exactly as much as
 * it adds tickets. Home and the engine details learned that; the tickets tab,
 * the lab card and the optimistic «cycle complete» patch kept calling
 * `effectiveCycleSeconds` with the speed inputs only. Same engine, same
 * player, two clocks: Home 11:46, Tickets 7:51 — and the tickets loop pinged
 * the server to complete a cycle that had four hours to run (17.08.2026).
 *
 * The status inputs are the same class of drift: a card that forgets `perks`
 * shows a Lucky Player the countdown of a nobody. So every call site outside
 * the utils that define the function must name all of these — a screen that
 * genuinely has no chip still passes `capacityChip: undefined`, on purpose,
 * where the next reader can see the decision.
 */

const REQUIRED_KEYS = [
  'speedChip',
  'speedBooster',
  'capacityChip',
  'capacityBooster',
  'isLuckyPlayer',
  'isVip',
  'perks',
] as const;

const SRC = resolve(process.cwd(), 'src');
// The definition and the itemised breakdown that mirrors it — they ARE the formula.
const DEFINING_FILES = new Set([
  'src/utils/global/ticket-engine.utils.ts',
  'src/utils/global/engine-boosts.utils.ts',
]);

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name)) out.push(full);
  }
  return out;
};

/** The text of every `effectiveCycleSeconds(...)` call, parentheses balanced. */
const callSites = (source: string): string[] => {
  const calls: string[] = [];
  const marker = 'effectiveCycleSeconds(';
  let from = 0;
  for (;;) {
    const start = source.indexOf(marker, from);
    if (start === -1) break;
    let depth = 0;
    let i = start + marker.length - 1;
    for (; i < source.length; i += 1) {
      if (source[i] === '(') depth += 1;
      else if (source[i] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    calls.push(source.slice(start, i + 1));
    from = i + 1;
  }
  return calls;
};

describe('effectiveCycleSeconds call sites', () => {
  const files = walk(SRC)
    .map(f => relative(process.cwd(), f))
    .filter(f => !DEFINING_FILES.has(f))
    .filter(f => readFileSync(f, 'utf8').includes('effectiveCycleSeconds('));

  it('exist (the guard is not scanning an empty set)', () => {
    expect(files.length).toBeGreaterThanOrEqual(6);
  });

  it.each(files)('%s passes every capacity and status input', file => {
    const calls = callSites(readFileSync(file, 'utf8'));
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) {
      const missing = REQUIRED_KEYS.filter(key => !new RegExp(`\\b${key}\\b`).test(call));
      expect(missing, `${file}\n${call}`).toEqual([]);
    }
  });
});
