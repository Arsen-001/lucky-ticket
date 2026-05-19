import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  ConvertStarsToLcRequest,
  ConvertStarsToLcResponse,
  LcState,
  LcTransaction,
} from '@/types/interfaces/lc.interfaces';

export const lcApi = api.injectEndpoints({
  endpoints: builder => ({
    getLcState: builder.query<LcState, void>({
      query: () => ({ url: 'lc' }),
      providesTags: [rtkTags.lc],
    }),
    getLcTransactions: builder.query<LcTransaction[], void>({
      query: () => ({ url: 'lc/transactions' }),
      providesTags: [rtkTags.lcTransactions],
    }),
    convertStarsToLc: builder.mutation<ConvertStarsToLcResponse, ConvertStarsToLcRequest>({
      query: body => ({ url: 'lc/convert', method: 'POST', body }),
      invalidatesTags: [rtkTags.lc, rtkTags.lcTransactions, rtkTags.me],
    }),
  }),
});

export const { useGetLcStateQuery, useGetLcTransactionsQuery, useConvertStarsToLcMutation } = lcApi;
