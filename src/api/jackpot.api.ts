import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { JackpotState, JackpotWinner } from '@/types/interfaces/jackpot.interfaces';

export const jackpotApi = api.injectEndpoints({
  endpoints: builder => ({
    getJackpot: builder.query<JackpotState, void>({
      query: () => ({ url: 'jackpot' }),
      providesTags: [rtkTags.jackpot],
    }),
    getJackpotWinners: builder.query<JackpotWinner[], void>({
      query: () => ({ url: 'jackpot/winners' }),
      providesTags: [rtkTags.jackpot],
    }),
  }),
});

export const { useGetJackpotQuery, useGetJackpotWinnersQuery } = jackpotApi;
