import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getTestQuestSteps, TEST_QUEST_TOTAL_LEVELS } from '@/constants/testQuest.constants';

/**
 * The checklist exists TWICE, and on production only one of the two is read.
 *
 * `GET /test-quest` sends the steps inside its ladder, and `resolveTestQuestSteps`
 * PREFERS them — the bundled constants are a fallback for an older backend.
 * So the server's copy is what a player actually sees, and the frontend's copy
 * is what every other test in this repo checks.
 *
 * That gap shipped a real bug on 18.08.2026: ten steps were given live counters
 * in the frontend constants and the backend copy was left as it was, so on
 * production «купи осколки» stayed at 0/20 no matter how many the player
 * bought — while localhost looked perfect, because the mock sends no steps and
 * the app fell back to the (correct) local copy. Every guard passed. The player
 * found it.
 *
 * This test diffs the two copies field by field. It needs the backend checked
 * out next to this repo and skips otherwise (CI clones only the frontend) —
 * which is exactly why it asserts loudly rather than silently: a skipped parity
 * test is how the drift survived in the first place.
 */

const levelsPath = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/test-quest/test-quest.levels.ts'
);
const hasBackend = existsSync(levelsPath);

interface WireStep {
  labelKey: string;
  target?: number;
  action?: string;
  kind: string;
  gate?: string;
}

/**
 * Parse `TEST_QUEST_STEPS` out of the backend source (a plain literal).
 *
 * Brace-balanced rather than line-based: the block is generated one step per
 * line, and prettier then wraps any step past 80 chars across four lines. A
 * line-based parser read those as `kind: ''` — caught by the first assertion
 * below, which is why that assertion exists.
 */
const parseBackendSteps = (source: string): Record<number, WireStep[]> => {
  const start = source.indexOf('export const TEST_QUEST_STEPS');
  const block = source.slice(start, source.indexOf('\n};\n', start));
  const out: Record<number, WireStep[]> = {};

  const levelHeads = [...block.matchAll(/\n {2}(\d+): \[/g)];
  for (let i = 0; i < levelHeads.length; i += 1) {
    const level = Number(levelHeads[i][1]);
    const from = levelHeads[i].index! + levelHeads[i][0].length;
    const to = i + 1 < levelHeads.length ? levelHeads[i + 1].index! : block.length;
    const body = block.slice(from, to);

    const steps: WireStep[] = [];
    for (const raw of body.match(/\{[^{}]*\}/g) ?? []) {
      const text = raw.replace(/\s+/g, ' ');
      const label = text.match(/labelKey: '([^']+)'/);
      if (!label) continue;
      const target = text.match(/target: (\d+)/);
      const action = text.match(/action: '([^']+)'/);
      const kind = text.match(/kind: '([^']+)'/);
      const gate = text.match(/gate: '([^']+)'/);
      steps.push({
        labelKey: label[1],
        ...(target ? { target: Number(target[1]) } : {}),
        ...(action ? { action: action[1] } : {}),
        kind: kind ? kind[1] : '',
        ...(gate ? { gate: gate[1] } : {}),
      });
    }
    out[level] = steps;
  }
  return out;
};

describe.skipIf(!hasBackend)('test-quest checklist — frontend ↔ backend parity', () => {
  const backend = hasBackend ? parseBackendSteps(readFileSync(levelsPath, 'utf8')) : {};

  it('the backend copy was parsed at all (a silent 0 would pass every case below)', () => {
    expect(Object.keys(backend)).toHaveLength(TEST_QUEST_TOTAL_LEVELS);
    // The one-line format is what the generator emits; a hand-edit that wraps a
    // step across lines would parse as `kind: ''` and must fail here, loudly.
    for (const [level, steps] of Object.entries(backend)) {
      for (const step of steps) {
        expect(step.kind, `level ${level}: ${step.labelKey} parsed without a kind`).not.toBe('');
      }
    }
  });

  const levels = Array.from({ length: TEST_QUEST_TOTAL_LEVELS }, (_, i) => i + 1);

  it.each(levels)('level %i matches field for field', level => {
    const mine = getTestQuestSteps(level).map(s => ({
      labelKey: s.labelKey,
      ...(s.target != null ? { target: s.target } : {}),
      ...(s.action ? { action: s.action } : {}),
      kind: s.kind,
      ...(s.gate ? { gate: s.gate } : {}),
    }));
    expect(backend[level], `level ${level} missing on the backend`).toBeDefined();
    expect(backend[level]).toEqual(mine);
  });
});
