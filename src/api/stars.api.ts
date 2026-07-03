import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { StarsState, StarsTransaction } from '@/types/interfaces/stars.interfaces';

export const starsApi = api.injectEndpoints({
  endpoints: builder => ({
    getStarsState: builder.query<StarsState, void>({
      query: () => ({ url: 'stars' }),
      providesTags: [rtkTags.stars],
    }),
    getStarsTransactions: builder.query<StarsTransaction[], void>({
      query: () => ({ url: 'stars/transactions' }),
      providesTags: [rtkTags.starsTransactions],
    }),
  }),
});

export const { useGetStarsStateQuery, useGetStarsTransactionsQuery } = starsApi;
