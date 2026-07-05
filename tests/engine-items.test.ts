import { describe, it, expect } from 'vitest';
import {
  mergeEngineItems,
  engineFieldsEqual,
  type EngineWithTier,
} from '@/utils/global/engine-items.utils';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';

const mk = (over: Partial<TicketEngine>): TicketEngine => ({
  id: 'e1',
  cycleSeconds: 7200,
  cycleStartedAt: '2026-01-01T00:00:00Z',
  pendingCount: 0,
  engineLevel: 1,
  speedLevel: 0,
  capacityLevel: 0,
  lifetimeProduced: 0,
  createdAt: '2026-01-01T00:00:00Z',
  ...over,
});

const item = (engine: TicketEngine): EngineWithTier => ({ engine, tier: 'bronze' });

/**
 * Guards the home-slider re-render fix: an engine upgrade must update ONLY the
 * cube that changed, not re-render the whole slider (which the old full
 * `flatFromTickets` rebuild did on every tickets-cache change).
 */
describe('mergeEngineItems — surgical re-seed (only-what-changed re-render)', () => {
  it('returns the SAME array reference when nothing changed → zero re-renders', () => {
    const prev = [item(mk({ id: 'a' })), item(mk({ id: 'b' }))];
    // A refetch of unchanged data: fresh objects, identical field values.
    const fresh = [item(mk({ id: 'a' })), item(mk({ id: 'b' }))];
    expect(mergeEngineItems(prev, fresh)).toBe(prev);
  });

  it('preserves identity for unchanged engines, new object only for the changed one', () => {
    const prev = [item(mk({ id: 'a' })), item(mk({ id: 'b', speedLevel: 3 }))];
    // Engine 'b' upgraded speed 3→4; 'a' untouched.
    const fresh = [item(mk({ id: 'a' })), item(mk({ id: 'b', speedLevel: 4 }))];
    const out = mergeEngineItems(prev, fresh);
    expect(out).not.toBe(prev); // the array itself changed…
    expect(out[0]).toBe(prev[0]); // …but 'a' keeps its object → its cube won't re-render
    expect(out[1]).toBe(fresh[1]); // 'b' is the fresh (changed) object → only its cube re-renders
    expect(out[1].engine.speedLevel).toBe(4);
  });

  it('a capacity upgrade only mints a new object for that engine', () => {
    const prev = [item(mk({ id: 'a' })), item(mk({ id: 'b', capacityLevel: 2 }))];
    const fresh = [item(mk({ id: 'a' })), item(mk({ id: 'b', capacityLevel: 3 }))];
    const out = mergeEngineItems(prev, fresh);
    expect(out[0]).toBe(prev[0]);
    expect(out[1]).toBe(fresh[1]);
  });

  it('a promotion (both sub-levels reset + engineLevel+1) counts as changed', () => {
    const prev = [item(mk({ id: 'a', speedLevel: 10, capacityLevel: 10, engineLevel: 1 }))];
    const fresh = [item(mk({ id: 'a', speedLevel: 0, capacityLevel: 0, engineLevel: 2 }))];
    const out = mergeEngineItems(prev, fresh);
    expect(out[0]).toBe(fresh[0]);
    expect(out[0].engine.engineLevel).toBe(2);
  });

  it('reflects a newly-bought engine while preserving the existing ones', () => {
    const prev = [item(mk({ id: 'a' }))];
    const fresh = [item(mk({ id: 'a' })), item(mk({ id: 'c' }))];
    const out = mergeEngineItems(prev, fresh);
    expect(out.map(i => i.engine.id)).toEqual(['a', 'c']);
    expect(out[0]).toBe(prev[0]);
  });

  it('engineFieldsEqual is false when any rendered field differs', () => {
    const base = mk({ id: 'x' });
    expect(engineFieldsEqual(base, mk({ id: 'x' }))).toBe(true);
    expect(engineFieldsEqual(base, mk({ id: 'x', pendingCount: 1 }))).toBe(false);
    expect(engineFieldsEqual(base, mk({ id: 'x', cycleStartedAt: '2026-02-02T00:00:00Z' }))).toBe(
      false
    );
  });
});
