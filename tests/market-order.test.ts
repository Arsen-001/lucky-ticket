import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sortMarketData } from '@/utils/global/market.utils';
import {
  MarketCosmeticType,
  MarketItemCategory,
  MarketStatusType,
} from '@/types/enums/market.enums';
import type { MarketData } from '@/types/interfaces/market.interfaces';

const root = process.cwd();

/**
 * The storefront order used to come straight from the catalog endpoint, which
 * has no ORDER BY — so Postgres returned rows in physical order and any UPDATE
 * (a supply decrement, the boot-time price sync, an admin edit) moved a row to
 * the end. Players saw the market reshuffle itself between visits. Mock
 * fixtures are authored in the right order, so this can only be caught by
 * feeding the sorter a shuffled catalog.
 */
const shuffled: MarketData = {
  engines: [
    {
      id: 'e-diamond',
      name: 'Diamond',
      prices: [],
      category: MarketItemCategory.ENGINE,
      ticketType: 'diamond',
      engineLevel: 1,
    },
    {
      id: 'e-bronze-2',
      name: 'Bronze II',
      prices: [],
      category: MarketItemCategory.ENGINE,
      ticketType: 'bronze',
      engineLevel: 2,
    },
    {
      id: 'e-gold',
      name: 'Gold',
      prices: [],
      category: MarketItemCategory.ENGINE,
      ticketType: 'gold',
      engineLevel: 1,
    },
    {
      id: 'e-bronze-1',
      name: 'Bronze I',
      prices: [],
      category: MarketItemCategory.ENGINE,
      ticketType: 'bronze',
      engineLevel: 1,
    },
    {
      id: 'e-silver',
      name: 'Silver',
      prices: [],
      category: MarketItemCategory.ENGINE,
      ticketType: 'silver',
      engineLevel: 1,
    },
    {
      id: 'e-platinum',
      name: 'Platinum',
      prices: [],
      category: MarketItemCategory.ENGINE,
      ticketType: 'platinum',
      engineLevel: 1,
    },
  ],
  tickets: [
    { id: 't-gold', name: 'Gold', prices: [], ticketType: 'gold', isAvailable: true },
    { id: 't-bronze', name: 'Bronze', prices: [], ticketType: 'bronze', isAvailable: true },
    { id: 't-diamond', name: 'Diamond', prices: [], ticketType: 'diamond', isAvailable: true },
    { id: 't-platinum', name: 'Platinum', prices: [], ticketType: 'platinum', isAvailable: true },
    { id: 't-silver', name: 'Silver', prices: [], ticketType: 'silver', isAvailable: true },
  ],
  shards: [
    {
      id: 's-gold-capacity',
      name: 'Gold capacity',
      prices: [],
      category: MarketItemCategory.SHARD,
      type: 'capacity',
      quality: 'gold',
      count: 1,
    },
    {
      id: 's-bronze-capacity',
      name: 'Bronze capacity',
      prices: [],
      category: MarketItemCategory.SHARD,
      type: 'capacity',
      quality: 'bronze',
      count: 1,
    },
    {
      id: 's-gold-speed',
      name: 'Gold speed',
      prices: [],
      category: MarketItemCategory.SHARD,
      type: 'speed',
      quality: 'gold',
      count: 1,
    },
    {
      id: 's-bronze-speed',
      name: 'Bronze speed',
      prices: [],
      category: MarketItemCategory.SHARD,
      type: 'speed',
      quality: 'bronze',
      count: 1,
    },
  ],
  cosmetics: [
    {
      id: 'c-10',
      name: 'Ten',
      prices: [],
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      avatarLevel: 10,
    },
    {
      id: 'c-none',
      name: 'Badge',
      prices: [],
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.BADGE,
    },
    {
      id: 'c-1',
      name: 'One',
      prices: [],
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      avatarLevel: 1,
    },
    {
      id: 'c-5',
      name: 'Five',
      prices: [],
      category: MarketItemCategory.COSMETIC,
      cosmeticType: MarketCosmeticType.AVATAR,
      avatarLevel: 5,
    },
  ],
  statuses: [
    { id: 'st-vip', name: 'VIP', prices: [], statusType: MarketStatusType.VIP },
    { id: 'st-lp', name: 'Lucky Player', prices: [], statusType: MarketStatusType.LUCKY_PLAYER },
  ],
};

const ids = <T extends { id: string }>(list: T[]): string[] => list.map(item => item.id);

describe('market catalog order', () => {
  const sorted = sortMarketData(shuffled);

  it('runs every tier ladder Bronze → Diamond', () => {
    expect(ids(sorted.tickets)).toEqual([
      't-bronze',
      't-silver',
      't-gold',
      't-platinum',
      't-diamond',
    ]);
    expect(ids(sorted.engines).slice(0, 3)).toEqual(['e-bronze-1', 'e-bronze-2', 'e-silver']);
  });

  it('groups shards by tier, speed chip before capacity', () => {
    expect(ids(sorted.shards)).toEqual([
      's-bronze-speed',
      's-bronze-capacity',
      's-gold-speed',
      's-gold-capacity',
    ]);
  });

  it('climbs avatar levels and parks a level-less cosmetic last', () => {
    expect(ids(sorted.cosmetics)).toEqual(['c-1', 'c-5', 'c-10', 'c-none']);
  });

  it('shows Lucky Player before VIP', () => {
    expect(ids(sorted.statuses)).toEqual(['st-lp', 'st-vip']);
  });

  it('gives the same order whatever order the server sent', () => {
    const reversed: MarketData = {
      engines: [...shuffled.engines].reverse(),
      tickets: [...shuffled.tickets].reverse(),
      shards: [...shuffled.shards].reverse(),
      cosmetics: [...shuffled.cosmetics].reverse(),
      statuses: [...shuffled.statuses].reverse(),
    };
    const again = sortMarketData(reversed);
    expect(ids(again.engines)).toEqual(ids(sorted.engines));
    expect(ids(again.tickets)).toEqual(ids(sorted.tickets));
    expect(ids(again.shards)).toEqual(ids(sorted.shards));
    expect(ids(again.cosmetics)).toEqual(ids(sorted.cosmetics));
    expect(ids(again.statuses)).toEqual(ids(sorted.statuses));
  });

  it('does not mutate the cached response', () => {
    const source = [...shuffled.tickets];
    sortMarketData(shuffled);
    expect(shuffled.tickets).toEqual(source);
  });

  /**
   * The sort only helps if the query applies it — a section rendering
   * `data.tickets` from an unsorted cache is exactly the bug this fixes.
   */
  it('is wired into the catalog query', () => {
    const api = readFileSync(resolve(root, 'src/api/market.api.ts'), 'utf8');
    expect(api).toMatch(/transformResponse:[^\n]*sortMarketData/);
  });
});
