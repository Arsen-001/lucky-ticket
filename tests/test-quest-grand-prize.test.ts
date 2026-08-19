import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TEST_QUEST_TOTAL_LEVELS } from '@/constants/testQuest.constants';
import {
  TEST_BADGE_CAPACITY_TICKETS,
  TEST_QUEST_QUALIFY_LEVEL,
  testBadgeCapacityTickets,
} from '@/utils/global/testQuest.utils';

/** Claims that finish the daily ladder (31 → floor). */
const FINISHED = TEST_QUEST_TOTAL_LEVELS - TEST_QUEST_QUALIFY_LEVEL + 1;

/**
 * The test quest's grand prize — permanent +3 bronze capacity — belongs to
 * EVERY player who finished the daily ladder, not to the single level-1 crown.
 * Changed 19.08.2026: the climb is the price, and the referral race decides rank
 * only, never whether 28 days of tasks counted.
 *
 * This number is re-derived on the client (a batch drawn on the engine cube and
 * predicted in three optimistic claim paths) and minted on the server. When the
 * two disagree the player is shown a collect that never lands.
 */
describe('test-quest grand prize — every finisher, nobody short', () => {
  it('pays every badge level a finish can produce', () => {
    // Finishing freezes the badge at a crown level (1–3) or, outside the bands,
    // at the qualify floor. All four are the same achievement to this prize.
    for (let level = 1; level <= TEST_QUEST_QUALIFY_LEVEL; level += 1) {
      expect(testBadgeCapacityTickets(level, FINISHED)).toBe(TEST_BADGE_CAPACITY_TICKETS);
    }
  });

  it('pays nothing one level short, though the badge reads the same', () => {
    // The trap the rule is written around: 27 claims stamps badge level 4, the
    // very number a qualified player outside the crown bands also carries. Only
    // `climbed` separates them.
    expect(testBadgeCapacityTickets(TEST_QUEST_QUALIFY_LEVEL, FINISHED - 1)).toBe(0);
    for (let climbed = 0; climbed < FINISHED; climbed += 1) {
      expect(testBadgeCapacityTickets(TEST_QUEST_TOTAL_LEVELS - climbed, climbed)).toBe(0);
    }
  });

  it('pays nothing while the test is still running', () => {
    // No badge minted yet ⇒ the prize has not started, however far they climbed.
    expect(testBadgeCapacityTickets(null, FINISHED)).toBe(0);
    expect(testBadgeCapacityTickets(undefined, FINISHED)).toBe(0);
  });
});

const backendPath = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/test-quest/test-quest.levels.ts'
);

describe.skipIf(!existsSync(backendPath))('backend ↔ frontend grand-prize parity', () => {
  it('mints the same batch the app draws', () => {
    const src = readFileSync(backendPath, 'utf8');
    // Same size…
    const size = src.match(/export const TEST_BADGE_CAPACITY_TICKETS = (\d+);/);
    expect(Number(size?.[1])).toBe(TEST_BADGE_CAPACITY_TICKETS);
    // …same floor…
    const floor = src.match(/export const TEST_QUEST_QUALIFY_LEVEL = (\d+);/);
    expect(Number(floor?.[1])).toBe(TEST_QUEST_QUALIFY_LEVEL);
    // …and the same question asked: `climbed`, never the badge level. A server
    // that goes back to `badgeLevel <= 1` would silently halve every finisher's
    // batch against a screen still promising it.
    const fn = src.slice(src.indexOf('export function testBadgeCapacityTickets'));
    expect(fn.slice(0, fn.indexOf('\n}'))).toMatch(/climbedWholeLadder\(climbed\)/);
  });
});

const backendLevels = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/test-quest/test-quest.levels.ts'
);

describe.skipIf(!existsSync(backendLevels))('one prize, one condition', () => {
  it('ships no second reward beside the grand prize', () => {
    // Finishing the ladder earns the permanent capacity and nothing else: the
    // monthly chest series and the freeze VIP grant were switched off on
    // 19.08.2026 rather than re-priced, so there is a single prize with a single
    // condition. Both are dormant (the panel can restore them), which is exactly
    // why the shipped DEFAULTS are worth asserting — a deploy is what carries them.
    const src = readFileSync(backendLevels, 'utf8');
    expect(src).toMatch(/export const TEST_QUEST_CHEST_MONTHS = 0;/);
    expect(src).toMatch(/export const TEST_QUEST_CROWN_VIP: TestQuestCrownVip\[\] = \[\];/);
  });
});
