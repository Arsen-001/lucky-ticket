import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  ConvertLcToTonRequest,
  ConvertLcToTonResponse,
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
    convertLcToTon: builder.mutation<ConvertLcToTonResponse, ConvertLcToTonRequest>({
      query: body => ({ url: 'lc/convert-ton', method: 'POST', body }),
      // Convert also writes a wallet DEPOSIT_TON transaction ("Converted from LC"),
      // so the wallet history must refresh too — not just the TON balance.
      invalidatesTags: [
        rtkTags.lc,
        rtkTags.lcTransactions,
        rtkTags.me,
        rtkTags.wallet,
        rtkTags.walletTransactions,
      ],
    }),
  }),
});

export const { useGetLcStateQuery, useGetLcTransactionsQuery, useConvertLcToTonMutation } = lcApi;
