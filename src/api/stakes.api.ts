import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { StakesData, StartStakeBody } from '@/types/interfaces/stakes.interfaces';

export const stakesApi = api.injectEndpoints({
  endpoints: builder => ({
    getStakes: builder.query<StakesData, void>({
      query: () => ({ url: 'stakes' }),
      providesTags: [rtkTags.stakes],
    }),
    startStake: builder.mutation<{ success: boolean }, StartStakeBody>({
      query: body => ({ url: 'stakes/start', method: 'POST', body }),
      invalidatesTags: [rtkTags.stakes, rtkTags.me],
    }),
    cancelStake: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: 'stakes/cancel', method: 'POST' }),
      invalidatesTags: [rtkTags.stakes, rtkTags.me],
    }),
    claimStake: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: 'stakes/claim', method: 'POST' }),
      invalidatesTags: [rtkTags.stakes, rtkTags.me],
    }),
  }),
});

export const {
  useGetStakesQuery,
  useStartStakeMutation,
  useCancelStakeMutation,
  useClaimStakeMutation,
} = stakesApi;
