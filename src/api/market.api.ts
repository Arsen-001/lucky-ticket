import dayjs from 'dayjs';
import { api } from '@/api/index.api';
import { inventoryApi } from '@/api/inventory.api';
import { meApi } from '@/api/me.api';
import { ticketsApi } from '@/api/tickets.api';
import { rtkTags } from '@/constants/rtk-tags';
import { chipShardsForNextLevel } from '@/utils/global/inventory.utils';
import { MarketPriceType } from '@/types/enums/market.enums';
import type {
  InventoryBoosterDuration,
  InventoryChipType,
} from '@/types/interfaces/inventory.interfaces';
import type { MarketData, MarketPrice } from '@/types/interfaces/market.interfaces';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const deductBalanceUpdater = (price: MarketPrice) =>
  meApi.util.updateQueryData('getMe', undefined, draft => {
    if (price.type === MarketPriceType.LTC) {
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
      invalidatesTags: [rtkTags.market, rtkTags.me, rtkTags.tickets],
    }),

    buyStatus: builder.mutation<void, { statusId: string; priceType: MarketPriceType }>({
      query: ({ statusId, priceType }) => ({
        url: `market/statuses/${statusId}/buy`,
        method: 'POST',
        body: { priceType },
      }),
      invalidatesTags: [rtkTags.market, rtkTags.me],
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
      async onQueryStarted({ tier, engineLevel, price }, { dispatch, queryFulfilled }) {
        const mePatch = dispatch(deductBalanceUpdater(price));
        const ticketsPatch = dispatch(
          ticketsApi.util.updateQueryData('getTickets', undefined, draft => {
            const ticket = draft.find(item => item.ticketType === tier);
            if (!ticket) return;
            const cycleByTier: Record<TicketType, number> = {
              bronze: 18,
              silver: 28,
              gold: 40,
              platinum: 60,
              diamond: 90,
            };
            const newEngine: TicketEngine = {
              id: `engine-${tier}-${Date.now()}`,
              cycleSeconds: cycleByTier[tier],
              perCycleOutput: 1,
              cycleStartedAt: dayjs().toISOString(),
              pendingCount: 0,
              instantClaimStarsCost: 5,
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

    buyChip: builder.mutation<
      void,
      {
        chipId: string;
        chipType: InventoryChipType;
        quality: TicketType;
        level: number;
        effectPct: number;
        price: MarketPrice;
      }
    >({
      query: ({ chipId, price }) => ({
        url: 'market/chips/buy',
        method: 'POST',
        body: { chipId, priceType: price.type },
      }),
      async onQueryStarted(
        { chipType, quality, level, effectPct, price },
        { dispatch, queryFulfilled }
      ) {
        const mePatch = dispatch(deductBalanceUpdater(price));
        const inventoryPatch = dispatch(
          inventoryApi.util.updateQueryData('getInventory', undefined, draft => {
            draft.chips = [
              ...draft.chips,
              {
                id: `chip-${quality}-${chipType}-${Date.now()}`,
                type: chipType,
                quality,
                level,
                effectPct,
                shardsForNextLevel: chipShardsForNextLevel(level),
                lifetime: 'permanent',
                source: 'tournament',
              },
            ];
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

    buyBuilder: builder.mutation<
      void,
      { builderId: string; tier: TicketType; count: number; price: MarketPrice }
    >({
      query: ({ builderId, price }) => ({
        url: 'market/builders/buy',
        method: 'POST',
        body: { builderId, priceType: price.type },
      }),
      async onQueryStarted({ tier, count, price }, { dispatch, queryFulfilled }) {
        const mePatch = dispatch(deductBalanceUpdater(price));
        const inventoryPatch = dispatch(
          inventoryApi.util.updateQueryData('getInventory', undefined, draft => {
            draft.builders = {
              ...draft.builders,
              [tier]: (draft.builders[tier] ?? 0) + count,
            };
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

    buyBooster: builder.mutation<
      void,
      {
        boosterId: string;
        boosterType: InventoryChipType;
        quality: TicketType;
        effectPct: number;
        durationHours: InventoryBoosterDuration;
        count: number;
        price: MarketPrice;
      }
    >({
      query: ({ boosterId, price }) => ({
        url: 'market/boosters/buy',
        method: 'POST',
        body: { boosterId, priceType: price.type },
      }),
      async onQueryStarted(
        { boosterType, quality, effectPct, durationHours, count, price },
        { dispatch, queryFulfilled }
      ) {
        const mePatch = dispatch(deductBalanceUpdater(price));
        const inventoryPatch = dispatch(
          inventoryApi.util.updateQueryData('getInventory', undefined, draft => {
            const newBoosters = Array.from({ length: count }).map((_, i) => ({
              id: `booster-${quality}-${boosterType}-${Date.now()}-${i}`,
              type: boosterType,
              quality,
              effectPct,
              durationHours,
              source: 'shop' as const,
            }));
            draft.boosters = [...draft.boosters, ...newBoosters];
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
      async onQueryStarted({ price }, { dispatch, queryFulfilled }) {
        const mePatch = dispatch(deductBalanceUpdater(price));
        try {
          await queryFulfilled;
        } catch {
          mePatch.undo();
        }
      },
    }),

    buyPass: builder.mutation<void, { passId: string; price: MarketPrice }>({
      query: ({ passId, price }) => ({
        url: 'market/passes/buy',
        method: 'POST',
        body: { passId, priceType: price.type },
      }),
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
  useBuyChipMutation,
  useBuyBuilderMutation,
  useBuyBoosterMutation,
  useBuyCosmeticMutation,
  useBuyPassMutation,
} = marketApi;
