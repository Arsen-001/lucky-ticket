import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  ClaimDailyGiftResponse,
  DailyGiftState,
} from '@/types/interfaces/status-gift.interfaces';

export const statusGiftApi = api.injectEndpoints({
  endpoints: builder => ({
    getDailyGift: builder.query<DailyGiftState, void>({
      query: () => ({ url: 'status/daily-gift' }),
      providesTags: [rtkTags.statusDailyGift],
    }),

    claimDailyGift: builder.mutation<ClaimDailyGiftResponse, void>({
      query: () => ({ url: 'status/daily-gift/claim', method: 'POST' }),
      // Coins and the ticket inventory both move, and the gift itself flips to
      // "collected" — refetching only the first two would leave the modal
      // offering a gift the server has already paid out.
      invalidatesTags: [
        rtkTags.statusDailyGift,
        rtkTags.me,
        rtkTags.lc,
        rtkTags.lcTransactions,
        rtkTags.tickets,
        rtkTags.inventory,
      ],
    }),
  }),
});

export const { useGetDailyGiftQuery, useClaimDailyGiftMutation } = statusGiftApi;
