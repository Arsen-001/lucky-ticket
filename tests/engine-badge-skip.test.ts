import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dayjs from 'dayjs';
import { effectiveCycleSeconds, engineElapsedSeconds } from '@/utils/global/ticket-engine.utils';
import { testBadgeSpeedBoostPct } from '@/utils/global/testQuest.utils';
import { TEST_QUEST_TOTAL_LEVELS } from '@/constants/testQuest.constants';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';

/**
 * Reproduction + guardrail for the "«Ускорить» не тратит звёзды" bug (@mikaevn).
 *
 * The backend applies the frozen Test-Quest badge speed boost to engine
 * readiness (`computeEngineState`). The frontend re-derives the cycle from base
 * values, so when it OMITS the badge boost it still thinks the engine is
 * mid-cycle — and keeps offering a paid "Ускорить" — after the server already
 * considers it ready. Tapping it hits `skipCycle`'s free no-op (`state.ready`),
 * so the optimistic star charge reverts and the stars are "never spent", forever.
 *
 * These tests drive the REAL frontend cycle math to pin that the badge boost is
 * now applied (readiness matches the server → the phantom paid skip is gone).
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
  // A level-1 badge is +15% → the server's cycle is 7200 / 1.15 ≈ 6261s. Elapsed
  // is picked INSIDE the divergence window: past the boosted cycle (server ready)
  // but before the un-boosted one (old frontend still counting down).
  const BADGE_PCT = testBadgeSpeedBoostPct(1);
  const engine = buildEngine(6600);
  const elapsed = engineElapsedSeconds(engine);

  it('level-1 badge is a +15% boost', () => {
    expect(BADGE_PCT).toBe(15);
  });

  it('WITHOUT the badge boost the frontend wrongly keeps the engine running → paid skip (the bug)', () => {
    const cycle = effectiveCycleSeconds(engine, {}); // old behaviour: no badge input
    expect(cycle).toBe(7200);
    expect(elapsed).toBeLessThan(cycle); // "not ready" → a paid "Ускорить" is shown
    const skipCost = Math.max(1, Math.ceil((cycle - elapsed) / 3600));
    expect(skipCost).toBeGreaterThanOrEqual(1); // UI charges ≥1⭐ that the server won't take
  });

  it('WITH the badge boost the frontend agrees the engine is ready → no phantom skip (the fix)', () => {
    const cycle = effectiveCycleSeconds(engine, { badgeBoostPct: BADGE_PCT });
    expect(cycle).toBeCloseTo(7200 / 1.15, 0); // ≈ 6261s, matching the server
    expect(elapsed).toBeGreaterThanOrEqual(cycle); // "ready" → button is Claim, skip not offered
  });
});

/**
 * Cross-repo parity: the frontend badge-boost bands must equal the backend's, or
 * the readiness fix above silently drifts again. Text-parsed from the backend
 * (skipped when it isn't checked out next to this repo), mirroring
 * engine-table-parity.test.ts.
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

  it('crown bands (levels 1-4) match the backend literals', () => {
    expect(testBadgeSpeedBoostPct(1)).toBe(
      grab(/badgeLevel <= 1\)\s*return\s*(\d+)/, 'level <= 1')
    );
    expect(testBadgeSpeedBoostPct(2)).toBe(grab(/badgeLevel === 2\)\s*return\s*(\d+)/, 'level 2'));
    expect(testBadgeSpeedBoostPct(3)).toBe(grab(/badgeLevel === 3\)\s*return\s*(\d+)/, 'level 3'));
    expect(testBadgeSpeedBoostPct(4)).toBe(grab(/badgeLevel === 4\)\s*return\s*(\d+)/, 'level 4'));
  });

  it('TEST_QUEST_TOTAL_LEVELS (the ladder formula anchor) matches the backend', () => {
    expect(TEST_QUEST_TOTAL_LEVELS).toBe(
      grab(/TEST_QUEST_TOTAL_LEVELS\s*=\s*(\d+)/, 'TEST_QUEST_TOTAL_LEVELS')
    );
  });
});
