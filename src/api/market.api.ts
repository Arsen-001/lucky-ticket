import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { MarketData } from '@/types/interfaces/market.interfaces';

export const marketApi = api.injectEndpoints({
  endpoints: builder => ({
    getMarketData: builder.query<MarketData, void>({
      query: () => ({ url: 'market' }),
      providesTags: [rtkTags.market],
    }),
    buyBoost: builder.mutation<void, string>({
      query: boostId => ({
        url: `market/boosts/${boostId}/buy`,
        method: 'POST',
      }),
      invalidatesTags: [rtkTags.market, rtkTags.me],
    }),
    buyTicket: builder.mutation<void, string>({
      query: ticketId => ({
        url: `market/tickets/${ticketId}/buy`,
        method: 'POST',
      }),
      invalidatesTags: [rtkTags.market, rtkTags.me, rtkTags.tickets],
    }),
    buyStatus: builder.mutation<void, string>({
      query: statusId => ({
        url: `market/statuses/${statusId}/buy`,
        method: 'POST',
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
