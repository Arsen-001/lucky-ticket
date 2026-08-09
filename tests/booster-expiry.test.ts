import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { findActiveBooster } from '@/utils/global/inventory.utils';
import { effectiveCycleSeconds } from '@/utils/global/ticket-engine.utils';
import type { InventoryBooster } from '@/types/interfaces/inventory.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';

const NOW = Date.parse('2026-08-09T12:00:00Z');
const HOUR = 3_600_000;

const booster = (over: Partial<InventoryBooster> = {}): InventoryBooster => ({
  id: 'b1',
  type: 'speed',
  quality: 'bronze',
  durationHours: 3,
  effectPct: 25,
  source: 'tournament',
  activeOnEngineId: 'e1',
  expiresAt: new Date(NOW + HOUR).toISOString(),
  ...over,
});

const engine: TicketEngine = {
  id: 'e1',
  cycleSeconds: 7200,
  cycleStartedAt: '2026-08-09T11:00:00Z',
  pendingCount: 0,
  engineLevel: 1,
  speedLevel: 0,
  capacityLevel: 0,
  lifetimeProduced: 0,
  createdAt: '2026-08-01T00:00:00Z',
};

/**
 * Boosters are time-limited consumables, but the row keeps `activeOnEngineId`
 * after the window closes. Matching on the assignment alone counted an expired
 * booster forever, so the cycle on screen stayed permanently faster than the
 * one the server actually mints at.
 */
describe('an expired booster stops counting (DOCS §10.6)', () => {
  // `effectiveCycleSeconds` checks the booster's window against the real clock,
  // so the "live" fixture below silently expired once wall-clock time passed
  // its `expiresAt` and the suite started failing on its own. Freeze time at
  // NOW — the same instant the fixtures are written against.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is found while its window is open', () => {
    expect(findActiveBooster([booster()], 'e1', 'speed', NOW)?.id).toBe('b1');
  });

  it('is gone the moment the window closes', () => {
    const spent = booster({ expiresAt: new Date(NOW - 1).toISOString() });
    expect(findActiveBooster([spent], 'e1', 'speed', NOW)).toBeUndefined();
  });

  it('an unknown window is not evidence it ran out — the boost stands', () => {
    // Same rule the backend applies to a Lucky Player with no recorded expiry:
    // only a date in the past may revoke, never a missing one.
    expect(findActiveBooster([booster({ expiresAt: undefined })], 'e1', 'speed', NOW)?.id).toBe(
      'b1'
    );
  });

  it('still filters by engine and slot type', () => {
    expect(findActiveBooster([booster()], 'e2', 'speed', NOW)).toBeUndefined();
    expect(findActiveBooster([booster()], 'e1', 'capacity', NOW)).toBeUndefined();
  });

  it('a spent booster no longer shortens the engine cycle', () => {
    const live = booster();
    const spent = booster({ expiresAt: new Date(NOW - 1).toISOString() });

    const withLive = effectiveCycleSeconds(engine, {
      speedBooster: findActiveBooster([live], 'e1', 'speed', NOW),
    });
    const withSpent = effectiveCycleSeconds(engine, {
      speedBooster: findActiveBooster([spent], 'e1', 'speed', NOW),
    });
    const bare = effectiveCycleSeconds(engine, {});

    expect(withLive).toBeLessThan(bare);
    expect(withSpent).toBe(bare);
  });
});

/**
 * The slot can hold two at once (activation never cleared it), so both sides
 * must pick the same one — the server's `activeBoosterPct` takes the strongest
 * still running, and this has to agree or the shown cycle drifts from the minted one.
 */
describe('two boosters in one slot', () => {
  it('the strongest running one wins', () => {
    const weak = booster({ id: 'weak', effectPct: 25 });
    const strong = booster({ id: 'strong', effectPct: 75 });
    expect(findActiveBooster([weak, strong], 'e1', 'speed', NOW)?.id).toBe('strong');
    expect(findActiveBooster([strong, weak], 'e1', 'speed', NOW)?.id).toBe('strong');
  });

  it('a stronger one that has run out does not win', () => {
    const live = booster({ id: 'live', effectPct: 25 });
    const spent = booster({
      id: 'spent',
      effectPct: 100,
      expiresAt: new Date(NOW - 1).toISOString(),
    });
    expect(findActiveBooster([live, spent], 'e1', 'speed', NOW)?.id).toBe('live');
  });
});
