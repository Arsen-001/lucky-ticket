import { describe, expect, it } from 'vitest';

import { TEST_QUEST_TOTAL_LEVELS } from '@/constants/testQuest.constants';
import { backendSteps, hasBackend, mockSteps } from './helpers/quest-steps';

/**
 * The checklist exists in two places, and only ONE of them is a source of
 * truth: the backend's `TEST_QUEST_STEPS`, which `GET /test-quest` sends and
 * the app renders verbatim. The other is `MOCK_STEPS` in the dev mock — what
 * localhost serves in place of a server.
 *
 * They must agree, or dev and production disagree about what the quest asks —
 * which is exactly the class of bug that shipped on 18.08.2026, back when the
 * second copy lived in the app's own constants AND doubled as a render
 * fallback. The fallback is gone; this test keeps the remaining pair honest.
 */
describe.skipIf(!hasBackend)('test-quest checklist — mock ↔ backend parity', () => {
  const backend = hasBackend ? backendSteps() : {};
  const mock = mockSteps();

  it('both copies parsed (a silent empty read would pass every case below)', () => {
    expect(Object.keys(backend)).toHaveLength(TEST_QUEST_TOTAL_LEVELS);
    expect(Object.keys(mock)).toHaveLength(TEST_QUEST_TOTAL_LEVELS);
    for (const [level, steps] of Object.entries(backend)) {
      expect(steps.length, `backend level ${level} is empty`).toBeGreaterThan(0);
      for (const step of steps) {
        expect(step.kind, `level ${level}: ${step.labelKey} parsed without a kind`).not.toBe('');
      }
    }
  });

  it.each(Array.from({ length: TEST_QUEST_TOTAL_LEVELS }, (_, i) => i + 1))(
    'level %i matches field for field',
    level => {
      expect(mock[level], `level ${level} missing in the mock`).toEqual(backend[level]);
    }
  );
});
