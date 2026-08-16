import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { makeStore } from '@/lib/rtk/store';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import { enginesApi } from '@/api/engines.api';
import { lcApi } from '@/api/lc.api';
import { marketApi } from '@/api/market.api';
import { meApi } from '@/api/me.api';
import { starsApi } from '@/api/stars.api';
import { walletApi } from '@/api/wallet.api';
import { marketMock } from '@/mock/market.mock';
import { MarketPriceType } from '@/types/enums/market.enums';

/**
 * Spending has to move every screen that shows the balance, not just the one
 * the author had open.
 *
 * Each currency is drawn from three or four different queries at once — the
 * header pill reads `getMe`, the drawer page reads `getLcState` / `getStarsState`,
 * the history below it reads the ledger query, and the wallet screen reads its
 * Stars balance from `GET /wallet` rather than from the stars query. A mutation
 * that invalidated only `me` therefore looked correct while testing (the pill
 * dropped) and was wrong everywhere else: /lc still showed the pre-purchase
 * balance with no row for the charge.
 *
 * Two guards below: the tags are grouped per currency in `balance-tags.ts` and
 * every mutation must take a whole group, and a spend really does refetch the
 * ledger screens through the store.
 */

const root = process.cwd();
const apiDir = resolve(root, 'src/api');

/** Each mutation in a `*.api.ts`, sliced from its name to the next one. */
function mutations(source: string) {
  const found: { name: string; body: string }[] = [];
  const starts: { name: string; index: number }[] = [];
  const re = /(\w+):\s*builder\.mutation</g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) starts.push({ name: match[1], index: match.index });
  starts.forEach((start, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].index : source.length;
    found.push({ name: start.name, body: source.slice(start.index, end) });
  });
  return found;
}

/**
 * Tags a mutation invalidates, as tag VALUES ('Lc', not the `rtkTags.lc` key it
 * was written as), with `...balanceTags.x` expanded to the group it stands for —
 * so listing the members by hand and spreading the helper both satisfy the rule,
 * and neither can drift from the other.
 */
function invalidated(body: string) {
  if (!body.includes('invalidatesTags:')) return new Set<string>();
  const block = body.slice(body.indexOf('invalidatesTags:'));
  const tags = new Set<string>();
  for (const [, group] of block.matchAll(/\.\.\.balanceTags\.(\w+)/g)) {
    for (const tag of balanceTags[group as keyof typeof balanceTags] ?? []) tags.add(tag);
  }
  for (const [, key] of block.matchAll(/rtkTags\.(\w+)/g)) {
    const value = rtkTags[key as keyof typeof rtkTags];
    if (value) tags.add(value);
  }
  return tags;
}

/**
 * One tag that can only mean "this currency moved" → the full group it drags in.
 * `me` and `wallet` are deliberately absent as triggers: `me` is invalidated by
 * anything touching the player record (a rename, an avatar), and `wallet` alone
 * is what connecting/disconnecting a wallet touches — neither implies money.
 */
const IMPLIES: { trigger: string[]; group: keyof typeof balanceTags }[] = [
  { trigger: ['Lc', 'LcTransactions'], group: 'lc' },
  { trigger: ['Stars', 'StarsTransactions'], group: 'stars' },
  { trigger: ['WalletTransactions'], group: 'ton' },
];

describe('a balance that moves is refreshed everywhere it is drawn', () => {
  it('every mutation that touches a currency invalidates that currency in full', () => {
    const offenders: string[] = [];

    for (const file of readdirSync(apiDir).filter(f => f.endsWith('.api.ts'))) {
      const source = readFileSync(resolve(apiDir, file), 'utf8');
      for (const { name, body } of mutations(source)) {
        const tags = invalidated(body);
        for (const { trigger, group } of IMPLIES) {
          if (!trigger.some(tag => tags.has(tag))) continue;
          const missing = balanceTags[group].filter(tag => !tags.has(tag));
          if (missing.length)
            offenders.push(
              `${file} → ${name}: touches ${group.toUpperCase()} but never refreshes ${missing.join(', ')}` +
                ` — spread \`...balanceTags.${group}\``
            );
        }
      }
    }

    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('the header pill is part of every money group', () => {
    // `me` is what the header reads; forgetting it is the loudest version of
    // this bug, so it is asserted separately from the scan above.
    expect(balanceTags.lc).toContain('Me');
    expect(balanceTags.stars).toContain('Me');
  });
});

/** Wait for a cache entry to settle on a response newer than `after`. */
const settled = async (read: () => { status: string; fulfilledTimeStamp?: number }, after = 0) => {
  for (let i = 0; i < 100; i++) {
    const entry = read();
    if (entry.status === 'fulfilled' && (entry.fulfilledTimeStamp ?? 0) > after) return entry;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`cache entry never refetched (status: ${read().status})`);
};

describe('spending refetches the screens that show the balance', () => {
  it('an LC purchase refreshes the header, the LC page and its history', async () => {
    const store = makeStore();

    const me = () => meApi.endpoints.getMe.select()(store.getState());
    const lc = () => lcApi.endpoints.getLcState.select()(store.getState());
    const history = () => lcApi.endpoints.getLcTransactions.select()(store.getState());

    store.dispatch(meApi.endpoints.getMe.initiate());
    store.dispatch(lcApi.endpoints.getLcState.initiate());
    store.dispatch(lcApi.endpoints.getLcTransactions.initiate());
    const before = await Promise.all([settled(me), settled(lc), settled(history)]);

    const ticketId = marketMock.tickets[0]?.id;
    expect(ticketId, 'fixture must hold a buyable ticket').toBeTruthy();

    await store
      .dispatch(
        marketApi.endpoints.buyTicket.initiate({
          ticketId,
          count: 1,
          priceType: MarketPriceType.LC,
        })
      )
      .unwrap();

    await settled(me, before[0].fulfilledTimeStamp!);
    await settled(lc, before[1].fulfilledTimeStamp!);
    await settled(history, before[2].fulfilledTimeStamp!);
  }, 30_000);

  it('a Lucky Stars charge refreshes the header, the Stars page and the wallet', async () => {
    const store = makeStore();

    const me = () => meApi.endpoints.getMe.select()(store.getState());
    const stars = () => starsApi.endpoints.getStarsState.select()(store.getState());
    const history = () => starsApi.endpoints.getStarsTransactions.select()(store.getState());
    // The wallet screen draws `starsBalance` from GET /wallet, so it goes stale
    // on a stars charge exactly like the stars page does.
    const wallet = () => walletApi.endpoints.getWalletState.select()(store.getState());

    store.dispatch(meApi.endpoints.getMe.initiate());
    store.dispatch(starsApi.endpoints.getStarsState.initiate());
    store.dispatch(starsApi.endpoints.getStarsTransactions.initiate());
    store.dispatch(walletApi.endpoints.getWalletState.initiate());
    const before = await Promise.all([
      settled(me),
      settled(stars),
      settled(history),
      settled(wallet),
    ]);

    await store
      .dispatch(enginesApi.endpoints.upgradeEngineSpeed.initiate({ engineId: 'engine-1', cost: 5 }))
      .unwrap();

    await settled(me, before[0].fulfilledTimeStamp!);
    await settled(stars, before[1].fulfilledTimeStamp!);
    await settled(history, before[2].fulfilledTimeStamp!);
    await settled(wallet, before[3].fulfilledTimeStamp!);
  }, 30_000);
});
