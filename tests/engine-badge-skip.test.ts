import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dayjs from 'dayjs';
import { effectiveCycleSeconds, engineElapsedSeconds } from '@/utils/global/ticket-engine.utils';
import { testBadgeSpeedBoostPct } from '@/utils/global/testQuest.utils';
import { TEST_QUEST_TOTAL_LEVELS } from '@/constants/testQuest.constants';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';

/**
 * Guardrail for the "«Ускорить» не тратит звёзды" bug (@mikaevn), kept alive
 * after the boost that caused it was removed.
 *
 * The backend applies any frozen Test-Quest badge speed boost to engine
 * readiness (`computeEngineState`), and the app re-derives the cycle from base
 * values. When the two disagreed, the app kept offering a paid "Ускорить" on an
 * engine the server already considered ready; the tap hit `skipCycle`'s free
 * no-op and the optimistic star charge reverted — stars "never spent", forever.
 *
 * Since 19.08.2026 the badge grants ONE thing, permanent bronze capacity, so the
 * boost is 0 on both sides and the divergence has nothing to open on. That is
 * what these tests now pin: not "the boost is applied", but "both sides agree" —
 * which is the property that actually prevented the bug, and the one that must
 * survive the boost being switched back on.
 */

const buildEngine = (elapsedSeconds: number): TicketEngine => ({
  id: 'engine-test',
  cycleSeconds: 7200, // 2h base — a Bronze-ish engine, well above the 900s floor
  cycleStartedAt: dayjs().subtract(elapsedSeconds, 'second').toISOString(),
  pendingCount: 0,
  engineLevel: 1,
  speedLevel: 0,
  capacityLevel: 0,
});

describe('engine badge-boost readiness (skip-cost bug repro)', () => {
  const engine = buildEngine(6600);
  const elapsed = engineElapsedSeconds(engine);

  it('the badge grants no speed at any level', () => {
    // The whole reward of finishing is permanent bronze capacity. A non-zero
    // here would be a second prize sneaking back in through the engine math.
    for (let level = 1; level <= TEST_QUEST_TOTAL_LEVELS; level += 1) {
      expect(testBadgeSpeedBoostPct(level)).toBe(0);
    }
    expect(testBadgeSpeedBoostPct(null)).toBe(0);
  });

  it('readiness matches the server, so no phantom paid skip can open', () => {
    // Both sides run the base cycle: passing the badge boost changes nothing,
    // which is exactly the agreement the bug needed broken.
    const withBadge = effectiveCycleSeconds(engine, {
      badgeBoostPct: testBadgeSpeedBoostPct(1),
    });
    const without = effectiveCycleSeconds(engine, {});
    expect(withBadge).toBe(without);
    expect(withBadge).toBe(7200);
    expect(elapsed).toBeLessThan(withBadge); // mid-cycle on BOTH sides — a paid skip here is real
  });

  it('still diverges if a boost is ever applied on one side only', () => {
    // The guard has to keep meaning something after the boost returns: feed a
    // hypothetical +15% and the two answers must part company. If this ever
    // stops being true, the test above has become a tautology.
    const boosted = effectiveCycleSeconds(engine, { badgeBoostPct: 15 });
    expect(boosted).toBeCloseTo(7200 / 1.15, 0);
    expect(elapsed).toBeGreaterThanOrEqual(boosted); // server would say "ready"
  });
});

/**
 * Cross-repo parity: the two badge-boost implementations must agree, or the
 * readiness divergence above reopens. Text-parsed from the backend (skipped when
 * it isn't checked out next to this repo), mirroring engine-table-parity.test.ts.
 */
const levelsPath = resolve(
  process.cwd(),
  '../lucky-ticket-backend/src/test-quest/test-quest.levels.ts'
);
const hasBackend = existsSync(levelsPath);

describe.skipIf(!hasBackend)('badge speed-boost bands ↔ backend parity', () => {
  const source = hasBackend ? readFileSync(levelsPath, 'utf8') : '';

  const grab = (re: RegExp, label: string): number => {
    const m = source.match(re);
    if (!m) throw new Error(`${label} not found in backend test-quest.levels.ts`);
    return Number(m[1]);
  };

  it('the backend grants no badge speed either', () => {
    // Both sides return 0 for every level. Asserted against the backend SOURCE,
    // because the failure that matters is one repo turning the boost back on
    // alone — which is precisely how the phantom skip happened the first time.
    const fn = source.slice(source.indexOf('export function testBadgeSpeedBoostPct'));
    const body = fn.slice(0, fn.indexOf('\n}'));
    expect(body).toMatch(/return 0;/);
    expect(body).not.toMatch(/return\s+(?!0;)\d+/);
    for (let level = 1; level <= TEST_QUEST_TOTAL_LEVELS; level += 1) {
      expect(testBadgeSpeedBoostPct(level)).toBe(0);
    }
  });

  it('TEST_QUEST_TOTAL_LEVELS (the ladder formula anchor) matches the backend', () => {
    expect(TEST_QUEST_TOTAL_LEVELS).toBe(
      grab(/TEST_QUEST_TOTAL_LEVELS\s*=\s*(\d+)/, 'TEST_QUEST_TOTAL_LEVELS')
    );
  });
});
