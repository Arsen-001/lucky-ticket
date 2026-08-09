import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { distributeClaimShortfall, resolveClaimedCount } from '@/utils/global/ticket-engine.utils';

/**
 * Guardrail for the count in the ticket-claim celebration modal.
 *
 * The modal used to report the client's own sum of `pendingCount` and ignore the
 * server's `{ claimed }` entirely. That sum is a prediction: `completeEngineCycle`
 * runs on a 1s interval and a second device can drain the same tier, so an engine
 * can flip to ready between the sum and the server handling the claim. The player
 * was then told "+7 tickets" while the inventory grew by 5 — and nothing on the
 * screen ever corrected it, because the claim mutations deliberately skip the
 * `tickets` invalidation (the optimistic patch is the only writer).
 *
 * Mocks could not catch this: `engines.mock.ts` answered a constant
 * `{ claimed: 1 }`, which looks right next to a 1-ticket engine and silently
 * wrong next to a claim-all. The mock now omits the field it cannot know.
 */

const root = resolve(__dirname, '..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('resolveClaimedCount', () => {
  it('prefers the server count over the local prediction', () => {
    expect(resolveClaimedCount({ claimed: 5 }, 7)).toBe(5);
  });

  it('reports a confirmed zero rather than the optimistic total', () => {
    // Someone else drained the tier first — the caller uses this to suppress
    // the celebration entirely instead of splashing "+7".
    expect(resolveClaimedCount({ claimed: 0 }, 7)).toBe(0);
  });

  it('falls back to the local total when the field is absent', () => {
    expect(resolveClaimedCount({}, 7)).toBe(7);
    expect(resolveClaimedCount(undefined, 7)).toBe(7);
  });

  it('treats a malformed count as absent — never renders a negative or NaN', () => {
    expect(resolveClaimedCount({ claimed: -1 }, 7)).toBe(7);
    expect(resolveClaimedCount({ claimed: Number.NaN }, 7)).toBe(7);
    expect(resolveClaimedCount({ claimed: '5' as unknown as number }, 7)).toBe(7);
  });
});

describe('distributeClaimShortfall', () => {
  const drained = [
    { engineId: 'a', amount: 3 },
    { engineId: 'b', amount: 2 },
    { engineId: 'c', amount: 4 },
  ];

  it('gives the shortfall back newest-first', () => {
    expect([...distributeClaimShortfall(drained, 3)]).toEqual([['c', 3]]);
  });

  it('spills into earlier engines once the newest is exhausted', () => {
    // 6 back out of c(4) + b(2).
    expect([...distributeClaimShortfall(drained, 6)]).toEqual([
      ['c', 4],
      ['b', 2],
    ]);
  });

  it('never takes back more than an engine contributed', () => {
    const giveback = distributeClaimShortfall(drained, 99);
    expect([...giveback.values()].reduce((sum, n) => sum + n, 0)).toBe(9);
    expect(giveback.get('a')).toBe(3);
  });

  it('sums to exactly the shortfall — the invariant lifetime counters rely on', () => {
    for (const shortfall of [1, 2, 5, 8, 9]) {
      const total = [...distributeClaimShortfall(drained, shortfall).values()].reduce(
        (sum, n) => sum + n,
        0
      );
      expect(total, `shortfall ${shortfall}`).toBe(shortfall);
    }
  });

  it('gives nothing back on a surplus or an exact match', () => {
    expect(distributeClaimShortfall(drained, 0).size).toBe(0);
    // Server claimed MORE than predicted — the cache sat a cycle behind it.
    expect(distributeClaimShortfall(drained, -4).size).toBe(0);
    expect(distributeClaimShortfall([], 5).size).toBe(0);
  });
});

describe('claim wiring', () => {
  it('the tickets tab reads the response instead of its own sum', () => {
    const view = read('src/components/pages/tabs/tickets/TicketsTabsView.tsx');
    // Both handlers — per-engine and per-tier — feed the same modal.
    expect(view.match(/resolveClaimedCount\(/g)?.length).toBe(2);
    // The pre-fix shape: opening the modal on a locally computed total.
    expect(view).not.toMatch(/setClaimedModal\(\{\s*open:\s*true,\s*tier,\s*count:\s*total\s*\}\)/);
  });

  it('every optimistic claim patch settles against the server count', () => {
    const api = read('src/api/engines.api.ts');
    // One per claim endpoint — per-engine, per-tier and the paid instant claim.
    // Without it the prediction is the last word: none of the three invalidates
    // `tickets`, so nothing refetches the inventory number the patch inflated.
    expect(api.match(/resolveClaimedCount\(data, predicted\) - predicted/g)?.length).toBe(3);
    expect(api).toMatch(/distributeClaimShortfall\(drained, -delta\)/);
    // Each must read the resolved value — `await queryFulfilled` alone (the
    // pre-fix shape, still correct for the void mutations) discards it.
    expect(api.match(/const \{ data \} = await queryFulfilled;/g)?.length).toBe(3);
  });

  it('the mock does not invent a claimed count it cannot know', () => {
    const mock = read('src/mock/engines.mock.ts');
    expect(mock).not.toMatch(/engines\/claim(-all)?':\s*\(\)\s*=>\s*\(\{\s*claimed:/);
  });

  it('the response types keep `claimed` optional so the fallback stays reachable', () => {
    const api = read('src/api/engines.api.ts');
    expect(api).toMatch(/claimEngine:\s*builder\.mutation<\{\s*claimed\?:\s*number\s*\}/);
    expect(api).toMatch(/claimEnginesForTier:\s*builder\.mutation<\{\s*claimed\?:\s*number\s*\}/);
    // instant-claim's mock answers a bare `{}` — a required `claimed` there was
    // a type the fixtures already contradicted.
    expect(api).toMatch(/instantClaimEngine:\s*builder\.mutation<\s*\{\s*claimed\?:\s*number/);
  });

  it('guards the files it asserts against still existing', () => {
    for (const path of [
      'src/components/pages/tabs/tickets/TicketsTabsView.tsx',
      'src/mock/engines.mock.ts',
      'src/api/engines.api.ts',
    ]) {
      expect(existsSync(resolve(root, path)), path).toBe(true);
    }
  });
});
