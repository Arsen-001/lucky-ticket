import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mapWithConcurrency } from '@/utils/global/async.utils';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

/**
 * The app has two «Забрать всё» buttons whose cost scales with the player: the
 * friends screen and the stakes screen. Neither backend has a bulk endpoint, so
 * each button is N requests — and both got the same two things wrong at once.
 *
 * They ran their claims in an `await` loop, so ten of anything meant ten
 * sequential round-trips with the button spinning through all of them. And each
 * claim invalidated its whole tag set — the friends list, the header pill, the
 * LC ledger; for stakes also the task chain, the Stars group and a forced
 * test-quest refetch — so those ten POSTs dragged dozens of GETs behind them,
 * every answer superseded by the next claim.
 *
 * Neither half shows up in a screenshot, and both are one careless edit away.
 * The engine tier button is deliberately absent from this table: it has a real
 * bulk endpoint (`claimEnginesForTier`) and is one request by construction.
 */
const BATCHES = [
  {
    what: 'друзья',
    screen: 'src/components/pages/out-tabs/drawer/invite-friends/InvitedFriendsList.tsx',
    api: 'src/api/referral.api.ts',
    handler: 'const handleClaimAll',
    items: 'targets',
    call: 'claimFriend({ friendId: friend.id, silent: true })',
    refresh: 'refreshAfterFriendClaims(dispatch)',
    tags: 'friendClaimTags',
  },
  {
    what: 'стейки',
    screen: 'src/components/pages/out-tabs/drawer/stakes/StakesContent.tsx',
    api: 'src/api/stakes.api.ts',
    handler: 'const handleClaimAll',
    items: 'readyStakeIds',
    call: 'claimStake({ stakeId: id, silent: true })',
    refresh: 'refreshAfterStakeClaims(dispatch)',
    tags: 'stakeClaimTags',
  },
] as const;

describe.each(BATCHES)('«Забрать всё» — $what', batch => {
  const screen = read(batch.screen);
  const api = read(batch.api);
  const body = (() => {
    const from = screen.slice(screen.indexOf(batch.handler));
    return from.slice(0, from.indexOf('\n  };'));
  })();

  it('шлёт пачку пулом, а не циклом с await', () => {
    expect(body).toContain(`mapWithConcurrency(${batch.items}, CLAIM_ALL_CONCURRENCY`);
    // The shape that was there before: `for (const x of <items>) { await … }`.
    expect(body).not.toMatch(
      new RegExp(String.raw`for\s*\(\s*const\s+\w+\s+of\s+${batch.items}\s*\)`)
    );
  });

  it('каждый клейм внутри пачки — молчащий', () => {
    expect(body).toContain(batch.call);
  });

  it('обновляет кеш один раз и на любом пути', () => {
    expect(body).toContain(batch.refresh);
    expect(body.match(new RegExp(String.raw`${batch.refresh.split('(')[0]}\(`, 'g'))).toHaveLength(
      1
    );
    // In `finally`: a batch that threw half-way has still moved money for the
    // claims that went through.
    expect(body).toMatch(
      new RegExp(String.raw`}\s*finally\s*{[^}]*${batch.refresh.replace(/[()]/g, '\\$&')}`)
    );
  });

  it('не пускает второй заход, пока кеш не обновился', () => {
    // The window between the last claim and the refetch it triggers: the list
    // there still shows what the server has already paid.
    expect(body).toMatch(/if \(\s*(isClaimingAll|claimingAll)/);
  });

  it('молчание — только опциональное: одиночный клейм по-прежнему инвалидирует', () => {
    expect(api).toContain(`(silent ? [] : ${batch.tags})`);
    expect(api).toContain(`api.util.invalidateTags(${batch.tags})`);
  });
});

/**
 * Stakes send a body, and the backend validates it with `forbidNonWhitelisted`
 * — so `silent` leaking into that body is a 400 on every claim of the batch,
 * not a harmless extra field. It has to be destructured away in `query`.
 */
it('флаг silent не уезжает в тело запроса', () => {
  expect(read('src/api/stakes.api.ts')).toContain('query: ({ silent: _silent, ...body })');
});

describe('mapWithConcurrency', () => {
  it('возвращает результаты в порядке входа, а не завершения', async () => {
    const result = await mapWithConcurrency([30, 10, 20, 0], 2, async value => {
      await new Promise(resolve => setTimeout(resolve, value));
      return value;
    });
    expect(result).toEqual([30, 10, 20, 0]);
  });

  it('не превышает лимит', async () => {
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

  it('доводит все воркеры до конца, прежде чем поднять ошибку', async () => {
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

  it('пустой список не поднимает ни одного воркера', async () => {
    expect(await mapWithConcurrency([], 4, async () => 1)).toEqual([]);
  });
});
