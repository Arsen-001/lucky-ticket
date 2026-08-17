import dayjs from 'dayjs';
import { api } from '@/api/index.api';
import { appConfig } from '@/config/app.config';
import { balanceTags } from '@/api/balance-tags';
import { inventoryApi } from '@/api/inventory.api';
import { meApi } from '@/api/me.api';
import { ticketsApi } from '@/api/tickets.api';
import { rtkTags } from '@/constants/rtk-tags';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type {
  MarketData,
  MarketPrice,
  MarketStatusSavings,
} from '@/types/interfaces/market.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { sortMarketData } from '@/utils/global/market.utils';

const deductBalanceUpdater = (price: MarketPrice) =>
  meApi.util.updateQueryData('getMe', undefined, draft => {
    if (price.type === MarketPriceType.LC) {
      draft.coins = Math.max(0, draft.coins - price.amount);
    } else if (price.type === MarketPriceType.TELEGRAM_STARS) {
      draft.telegramStars = Math.max(0, draft.telegramStars - price.amount);
    }
  });

export const marketApi = api.injectEndpoints({
  endpoints: builder => ({
    getMarketData: builder.query<MarketData, void>({
      query: () => ({ url: 'market' }),
      // The catalog arrives in whatever order Postgres physically stored the
      // rows, which changes after any UPDATE — so the storefront reshuffled
      // itself on every visit. Sorting here (not per section) makes the cards,
      // the hero carousel and the info sheet share one canonical order.
      transformResponse: (response: MarketData) => sortMarketData(response),
      providesTags: [rtkTags.market],
    }),

    getMarketStatusSavings: builder.query<MarketStatusSavings, void>({
      query: () => ({ url: 'market/savings' }),
      providesTags: [rtkTags.marketSavings],
    }),

    buyTicket: builder.mutation<
      void,
      { ticketId: string; count: number; priceType: MarketPriceType }
    >({
      query: ({ ticketId, count, priceType }) => ({
        url: `market/tickets/${ticketId}/buy`,
        method: 'POST',
        body: { count, priceType },
      }),
      // Both currency groups: the shelf prices tickets in LC *and* in Stars, and
      // `priceType` decides which one the server charges — so refreshing only
      // the LC surfaces left a Stars-paid purchase invisible on /stars.
      // A market purchase moves three quest/task counters (tickets bought,
      // shards bought, engines owned) and several task counters with them, so
      // both surfaces refresh at the moment of the buy rather than on the next
      // visit. @see refetchTestQuestProgress
      invalidatesTags: [
        rtkTags.tasks,
        rtkTags.marketSavings,
        rtkTags.market,
        rtkTags.tickets,
        ...balanceTags.lc,
        ...balanceTags.stars,
      ],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          refetchTestQuestProgress(dispatch);
        } catch {
          // A refused purchase moved nothing.
        }
      },
    }),

    buyStatus: builder.mutation<void, { statusId: string; priceType: MarketPriceType }>({
      query: ({ statusId, priceType }) => ({
        url: 'market/statuses/buy',
        method: 'POST',
        body: { statusId, priceType },
      }),
      // `profile` too: the profile hero renders isVIP/isLuckyPlayer/vipLevel
      // from its own query — without it the badges stay stale after a purchase.
      // `tickets` as well: a status carries an engine-speed perk, and the engine
      // fields the SERVER resolves with it (instant-claim cost, pending count)
      // come from /tickets — without the refetch they quote the pre-purchase
      // status until something else happens to invalidate them.
      // A market purchase moves three quest/task counters (tickets bought,
      // shards bought, engines owned) and several task counters with them, so
      // both surfaces refresh at the moment of the buy rather than on the next
      // visit. @see refetchTestQuestProgress
      invalidatesTags: [
        rtkTags.tasks,
        rtkTags.marketSavings,
        rtkTags.market,
        rtkTags.profile,
        rtkTags.tickets,
        ...balanceTags.lc,
        ...balanceTags.stars,
      ],
    }),

    buyEngine: builder.mutation<
      void,
      { engineId: string; tier: TicketType; engineLevel: number; price: MarketPrice }
    >({
      query: ({ engineId, price }) => ({
        url: 'market/engines/buy',
        method: 'POST',
        body: { engineId, priceType: price.type },
      }),
      // A market purchase moves three quest/task counters (tickets bought,
      // shards bought, engines owned) and several task counters with them, so
      // both surfaces refresh at the moment of the buy rather than on the next
      // visit. @see refetchTestQuestProgress
      invalidatesTags: [
        rtkTags.tasks,
        rtkTags.marketSavings,
        rtkTags.market,
        rtkTags.tickets,
        ...balanceTags.lc,
        ...balanceTags.stars,
      ],
      async onQueryStarted({ tier, engineLevel, price }, { dispatch, queryFulfilled }) {
        const mePatch = dispatch(deductBalanceUpdater(price));
        const ticketsPatch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            const ticket = draft.find(item => item.ticketType === tier);
            if (!ticket) return;
            const newEngine: TicketEngine = {
              id: `engine-${tier}-${Date.now()}`,
              // Real base cycle for the tier (DOCS §9.7) — the server refetch
              // replaces this, but an optimistic value must not read as a bogus
              // few-second cycle in the flash before it lands.
              cycleSeconds: appConfig.engines.baseCycleSecondsByTier[tier],
              cycleStartedAt: dayjs().toISOString(),
              pendingCount: 0,
              engineLevel,
              speedLevel: 0,
              capacityLevel: 0,
            };
            ticket.engines = [...(ticket.engines ?? []), newEngine];
          })
        );
        try {
          await queryFulfilled;
          refetchTestQuestProgress(dispatch);
        } catch {
          mePatch.undo();
          ticketsPatch.undo();
        }
      },
    }),

    buyShard: builder.mutation<
      void,
      {
        shardId: string;
        shardType: InventoryChipType;
        quality: TicketType;
        /** Bundle size of the SKU («+5 shards») — informational, the backend reads its own. */
        count: number;
        /** How many bundles in THIS order — one request, one balance-guarded charge. */
        quantity: number;
        price: MarketPrice;
      }
    >({
      query: ({ shardId, quantity, price }) => ({
        url: 'market/shards/buy',
        method: 'POST',
        body: { shardId, quantity, priceType: price.type },
      }),
      // A market purchase moves three quest/task counters (tickets bought,
      // shards bought, engines owned) and several task counters with them, so
      // both surfaces refresh at the moment of the buy rather than on the next
      // visit. @see refetchTestQuestProgress
      invalidatesTags: [
        rtkTags.tasks,
        rtkTags.marketSavings,
        rtkTags.market,
        rtkTags.inventory,
        ...balanceTags.lc,
        ...balanceTags.stars,
      ],
      async onQueryStarted({ shardType, quality, count, price }, { dispatch, queryFulfilled }) {
        const mePatch = dispatch(deductBalanceUpdater(price));
        const inventoryPatch = dispatch(
          inventoryApi.util.updateQueryData('getInventory', undefined, draft => {
            const existing = draft.shards.find(s => s.type === shardType && s.quality === quality);
            if (existing) {
              existing.count += count;
            } else {
              draft.shards = [...draft.shards, { type: shardType, quality, count }];
            }
          })
        );
        try {
          await queryFulfilled;
          refetchTestQuestProgress(dispatch);
        } catch {
          mePatch.undo();
          inventoryPatch.undo();
        }
      },
    }),

    buyCosmetic: builder.mutation<void, { cosmeticId: string; price: MarketPrice }>({
      query: ({ cosmeticId, price }) => ({
        url: 'market/cosmetics/buy',
        method: 'POST',
        body: { cosmeticId, priceType: price.type },
      }),
      // A market purchase moves three quest/task counters (tickets bought,
      // shards bought, engines owned) and several task counters with them, so
      // both surfaces refresh at the moment of the buy rather than on the next
      // visit. @see refetchTestQuestProgress
      invalidatesTags: [
        rtkTags.tasks,
        rtkTags.marketSavings,
        rtkTags.market,
        rtkTags.avatars,
        ...balanceTags.lc,
        ...balanceTags.stars,
      ],
      async onQueryStarted({ price }, { dispatch, queryFulfilled }) {
        const mePatch = dispatch(deductBalanceUpdater(price));
        try {
          await queryFulfilled;
        } catch {
          mePatch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetMarketDataQuery,
  useGetMarketStatusSavingsQuery,
  useBuyTicketMutation,
  useBuyStatusMutation,
  useBuyEngineMutation,
  useBuyShardMutation,
  useBuyCosmeticMutation,
} = marketApi;
