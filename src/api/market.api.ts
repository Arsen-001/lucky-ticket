import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { MarketData } from '@/types/interfaces/market.interfaces';
import type { MarketPriceType } from '@/types/enums/market.enums';

export const marketApi = api.injectEndpoints({
  endpoints: builder => ({
    getMarketData: builder.query<MarketData, void>({
      query: () => ({ url: 'market' }),
      providesTags: [rtkTags.market],
    }),
    buyBoost: builder.mutation<void, { boostId: string; priceType: MarketPriceType }>({
      query: ({ boostId }) => ({
        url: `market/boosts/${boostId}/buy`,
        method: 'POST',
      }),
      invalidatesTags: [rtkTags.market, rtkTags.me],
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
  }),
});

export const {
  useGetMarketDataQuery,
  useBuyBoostMutation,
  useBuyTicketMutation,
  useBuyStatusMutation,
} = marketApi;
