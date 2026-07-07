import dayjs from 'dayjs';
import { api } from '@/api/index.api';
import { appConfig } from '@/config/app.config';
import { inventoryApi } from '@/api/inventory.api';
import { meApi } from '@/api/me.api';
import { ticketsApi } from '@/api/tickets.api';
import { rtkTags } from '@/constants/rtk-tags';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { MarketData, MarketPrice } from '@/types/interfaces/market.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

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
      providesTags: [rtkTags.market],
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
      invalidatesTags: [
        rtkTags.market,
        rtkTags.me,
        rtkTags.tickets,
        rtkTags.lc,
        rtkTags.lcTransactions,
      ],
    }),

    buyStatus: builder.mutation<void, { statusId: string; priceType: MarketPriceType }>({
      query: ({ statusId, priceType }) => ({
        url: 'market/statuses/buy',
        method: 'POST',
        body: { statusId, priceType },
      }),
      invalidatesTags: [rtkTags.market, rtkTags.me, rtkTags.lc, rtkTags.lcTransactions],
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
      invalidatesTags: [
        rtkTags.market,
        rtkTags.me,
        rtkTags.tickets,
        rtkTags.lc,
        rtkTags.lcTransactions,
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
        count: number;
        price: MarketPrice;
      }
    >({
      query: ({ shardId, price }) => ({
        url: 'market/shards/buy',
        method: 'POST',
        body: { shardId, priceType: price.type },
      }),
      invalidatesTags: [
        rtkTags.market,
        rtkTags.me,
        rtkTags.inventory,
        rtkTags.lc,
        rtkTags.lcTransactions,
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
      invalidatesTags: [rtkTags.market, rtkTags.me, rtkTags.lc, rtkTags.lcTransactions],
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
  useBuyTicketMutation,
  useBuyStatusMutation,
  useBuyEngineMutation,
  useBuyShardMutation,
  useBuyCosmeticMutation,
} = marketApi;
