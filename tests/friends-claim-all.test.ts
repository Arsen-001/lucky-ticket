import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mapWithConcurrency } from '@/utils/global/async.utils';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

const LIST = 'src/components/pages/out-tabs/drawer/invite-friends/InvitedFriendsList.tsx';
const API = 'src/api/referral.api.ts';

/**
 * «Забрать всё» is N requests, because the backend has no bulk claim — it is
 * `POST referral/claim/:friendId` and nothing else. That makes the button the
 * one place in the app whose cost scales with how many friends a player has,
 * and it got both halves of that wrong at once: the claims ran in an `await`
 * loop (ten friends = ten sequential round-trips), and each one invalidated the
 * friends list, the header pill and the whole LC ledger, so those ten POSTs
 * dragged ~30 GETs behind them — every answer superseded by the next claim.
 *
 * Neither half is visible in a screenshot; both are one careless edit away.
 */
describe('collecting every friend costs one wait, not one per friend', () => {
  const list = read(LIST);

  it('fires the claims through the pool instead of an await loop', () => {
    expect(list).toContain('mapWithConcurrency(targets, CLAIM_ALL_CONCURRENCY');
    // The shape that was there before: `for (const friend of targets) { await … }`.
    expect(list).not.toMatch(/for\s*\(\s*const\s+\w+\s+of\s+targets\s*\)/);
  });

  it('sends every batched claim silently', () => {
    // Any claim inside the batch must carry `silent`, or the invalidation storm
    // comes straight back.
    expect(list).toContain('claimFriend({ friendId: friend.id, silent: true })');
  });

  it('refreshes once for the whole batch, on every path', () => {
    const batch = list.slice(list.indexOf('const handleClaimAll'));
    const body = batch.slice(0, batch.indexOf('\n  };'));
    expect(body).toContain('refreshAfterFriendClaims(dispatch)');
    expect(body.match(/refreshAfterFriendClaims\(/g)).toHaveLength(1);
    // In `finally`: a batch that threw half-way has still moved money for the
    // claims that went through.
    expect(body).toMatch(/}\s*finally\s*{[^}]*refreshAfterFriendClaims\(dispatch\)/);
  });

  it('celebrates only what the server granted', () => {
    const batch = list.slice(list.indexOf('const handleClaimAll'));
    const body = batch.slice(0, batch.indexOf('\n  };'));
    // The snapshot is built from the successful outcomes, never from `targets`
    // — a refusal must not announce LC the player never received.
    expect(body).toMatch(/setClaimAllSnapshot\(\{\s*friends: claimed/);
    expect(body).not.toMatch(/setClaimAllSnapshot\(\{\s*friends: targets/);
  });
});

/**
 * The silent flag is an opt-OUT of cache invalidation. A single claim — the
 * per-friend sheet — must keep invalidating, or the row it just paid stays on
 * screen with its reward intact.
 */
describe('silence is only ever opted into', () => {
  const api = read(API);

  it('keeps the full tag set for an ordinary claim', () => {
    expect(api).toContain(
      'invalidatesTags: (_result, _error, { silent }) => (silent ? [] : friendClaimTags)'
    );
    expect(api).toMatch(
      /export const friendClaimTags = \[rtkTags\.referral, rtkTags\.tickets, \.\.\.balanceTags\.lc\]/
    );
  });

  it('gives the batch the same tags it suppressed', () => {
    const helper = api.slice(api.indexOf('export const refreshAfterFriendClaims'));
    expect(helper).toContain('api.util.invalidateTags(friendClaimTags)');
  });
});

describe('mapWithConcurrency', () => {
  it('returns results in input order, not completion order', async () => {
    const result = await mapWithConcurrency([30, 10, 20, 0], 2, async value => {
      await new Promise(resolve => setTimeout(resolve, value));
      return value;
    });
    expect(result).toEqual([30, 10, 20, 0]);
  });

  it('never exceeds the limit', async () => {
    let inFlight = 0;
    let peak = 0;
    await mapWithConcurrency(
      Array.from({ length: 20 }, (_, i) => i),
      4,
      async () => {
        inFlight += 1;
        peak = Math.max(peak, inFlight);
        await new Promise(resolve => setTimeout(resolve, 1));
        inFlight -= 1;
        return null;
      }
    );
    expect(peak).toBe(4);
  });

  it('settles every runner before surfacing a failure', async () => {
    let finished = 0;
    await expect(
      mapWithConcurrency([1, 2, 3, 4], 2, async value => {
        await new Promise(resolve => setTimeout(resolve, 1));
        if (value === 1) throw new Error('boom');
        finished += 1;
        return value;
      })
    ).rejects.toThrow('boom');
    // The other three still ran to completion — no runner is left dangling with
    // an unhandled rejection behind it.
    expect(finished).toBe(3);
  });

  it('handles an empty list without spawning a runner', async () => {
    expect(await mapWithConcurrency([], 4, async () => 1)).toEqual([]);
  });
});
