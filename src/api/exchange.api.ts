import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { ExchangeHistoryItem, ExchangeResponse } from '@/types/interfaces/exchange.interfaces';

export const exchangeApi = api.injectEndpoints({
  endpoints: builder => ({
    getExchangeData: builder.query<ExchangeResponse, void>({
      query: () => ({ url: 'exchange' }),
      providesTags: [rtkTags.exchange],
    }),
    getExchangeHistory: builder.query<ExchangeHistoryItem[], void>({
      query: () => ({ url: 'exchange/history' }),
      providesTags: [rtkTags.exchange],
    }),
    exchange: builder.mutation<{ success: boolean }, { offerId: string }>({
      query: body => ({
        url: 'exchange',
        method: 'POST',
        body,
      }),
      invalidatesTags: [rtkTags.exchange, rtkTags.me],
    }),
  }),
});

export const { useGetExchangeDataQuery, useGetExchangeHistoryQuery, useExchangeMutation } =
  exchangeApi;
