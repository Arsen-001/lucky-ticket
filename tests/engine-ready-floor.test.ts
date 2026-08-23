import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  engineElapsedAligned,
  isEngineReady,
  serverReadyAt,
} from '@/utils/global/ticket-engine.utils';
import { isNotReadyError } from '@/utils/global/spend-failure.utils';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';

/**
 * «Забрать» must never appear before the SERVER agrees the cycle is over.
 *
 * Every screen ticks its own countdown — it has to, nothing else runs between
 * requests — from the device clock and this bundle's copy of the boost math.
 * When that ran ahead of the server nobody found out until the tap: the button
 * appeared, `POST engines/claim` answered «Engine still producing», and the
 * player read «Не удалось забрать награду» over an engine that was simply
 * still working.
 *
 * Measured on production 23.08.2026 (Railway HTTP logs, 00:00–10:30 UTC):
 * 9 of 165 `engines/claim` and 4 of 9 `engines/claim-all` came back 400, and
 * EVERY one of them landed 2–3 seconds after a `complete-cycle` the server had
 * answered `{ok:true}` to without writing anything. Players tapped four times
 * in twenty seconds and were refused each time.
 *
 * The fix has two halves and this file guards both: the server states what it
 * has left (`secondsRemaining` on `/tickets` and on every claim answer), and
 * the client counts down to THAT rather than to its own arithmetic — in both
 * directions, since a client running slow held back a collect the server would
 * have paid.
 */

const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');

const engine = (over: Partial<TicketEngine> = {}): TicketEngine => ({
  id: 'e1',
  tier: 'bronze',
  cycleSeconds: 7200,
  // Two hours ago: finished by the local clock, whatever the server thinks.
  cycleStartedAt: new Date(Date.now() - 7200_000).toISOString(),
  pendingCount: 0,
  engineLevel: 1,
  speedLevel: 0,
  capacityLevel: 0,
  ...over,
});

describe('the server owns the remainder of an engine cycle', () => {
  it('a locally-finished cycle is NOT ready while the server says seconds remain', () => {
    const e = engine({ readyAt: serverReadyAt(120) });
    expect(isEngineReady(e, 7200)).toBe(false);
    // …and the countdown shows the server's remainder, not a full bar.
    expect(engineElapsedAligned(e, 7200)).toBeCloseTo(7080, 0);
  });

  it('goes ready the moment the server floor passes', () => {
    const e = engine({ readyAt: serverReadyAt(0) });
    expect(isEngineReady(e, 7200)).toBe(true);
  });

  it('a banked batch is ready regardless of any floor', () => {
    const e = engine({ pendingCount: 3, readyAt: serverReadyAt(3600) });
    expect(isEngineReady(e, 7200)).toBe(true);
  });

  it('without a server verdict the local countdown still decides', () => {
    expect(isEngineReady(engine(), 7200)).toBe(true);
    expect(isEngineReady(engine({ cycleStartedAt: new Date().toISOString() }), 7200)).toBe(false);
  });

  it('a client running SLOW is corrected too — the server can hand it over early', () => {
    // Local cycle has an hour left, the server says it is done. The collect
    // would go through, so holding the button back only makes the player wait
    // for tickets they already own.
    const e = engine({
      cycleStartedAt: new Date(Date.now() - 3600_000).toISOString(),
      readyAt: serverReadyAt(0),
    });
    expect(isEngineReady(e, 7200)).toBe(true);
  });

  it('the server remainder wins even when the local countdown is way behind', () => {
    const e = engine({
      cycleStartedAt: new Date(Date.now() - 600_000).toISOString(),
      readyAt: serverReadyAt(60),
    });
    expect(engineElapsedAligned(e, 7200)).toBeCloseTo(7140, 0);
    expect(isEngineReady(e, 7200)).toBe(false);
  });
});

describe('«still producing» is not an error', () => {
  it('is recognised by reason, not by message text', () => {
    expect(isNotReadyError({ status: 400, data: { reason: 'not-ready' } })).toBe(true);
    expect(isNotReadyError({ status: 400, data: { message: 'Nothing to claim' } })).toBe(false);
    expect(isNotReadyError({ status: 409 })).toBe(false);
    expect(isNotReadyError(undefined)).toBe(false);
  });

  it('every claim screen routes it to an info toast, never to «claim failed»', () => {
    for (const path of [
      'src/components/pages/tabs/home/HomeEnginesSlider.tsx',
      'src/components/pages/tabs/tickets/TicketsTabsView.tsx',
      'src/components/pages/out-tabs/tabs-extra/engine/EngineDetails.tsx',
    ]) {
      const source = read(path);
      expect(source, path).toMatch(
        /isNotReadyError\(error\)\)\s*toast\.info\(t\('claim not ready'\)\)/
      );
    }
  });
});

describe('the client takes the server state it is handed', () => {
  const api = read('src/api/engines.api.ts');

  it('writes the server verdict into the tickets cache', () => {
    // claim, claim-all, complete-cycle and the two refusals all funnel here.
    expect(api.match(/applyEngineSync\(/g)?.length).toBeGreaterThanOrEqual(5);
    expect(api).toMatch(/engine\.readyAt = serverReadyAt\(sync\.secondsRemaining/);
  });

  it('restarts the claimed cycle even when the cache banked no batch', () => {
    // The bug: the optimistic patch only touched engines with pendingCount > 0,
    // so a cycle that finished without a `complete-cycle` landing was claimed on
    // the server and left «ready» in the cache — the button stayed, for a 400.
    expect(api).not.toMatch(/if \(engine && engine\.pendingCount > 0\) \{/);
  });

  it('undoes its own prediction when the server disagrees the cycle ended', () => {
    expect(api).toMatch(/if \(data && data\.ok === false\) patch\.undo\(\);/);
  });

  it('pins the /tickets countdown to this device clock on arrival', () => {
    expect(read('src/api/tickets.api.ts')).toMatch(
      /readyAt: serverReadyAt\(engine\.secondsRemaining, now\)/
    );
  });
});
