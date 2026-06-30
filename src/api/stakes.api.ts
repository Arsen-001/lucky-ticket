import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { StakeIdBody, StakesData, StartStakeBody } from '@/types/interfaces/stakes.interfaces';

export const stakesApi = api.injectEndpoints({
  endpoints: builder => ({
    getStakes: builder.query<StakesData, void>({
      query: () => ({ url: 'stakes' }),
      providesTags: [rtkTags.stakes],
    }),
    startStake: builder.mutation<{ success: boolean }, StartStakeBody>({
      query: body => ({ url: 'stakes/start', method: 'POST', body }),
      // Deposits LC + a star fee → refresh stakes, balances (me) and the wallet
      // (stars balance) so every surface that shows them updates immediately.
      invalidatesTags: [rtkTags.stakes, rtkTags.me, rtkTags.lc, rtkTags.wallet],
    }),
    cancelStake: builder.mutation<{ success: boolean }, StakeIdBody>({
      query: body => ({ url: 'stakes/cancel', method: 'POST', body }),
      // Charges a star cancel fee + returns the deposit → same balance surfaces.
      invalidatesTags: [rtkTags.stakes, rtkTags.me, rtkTags.lc, rtkTags.wallet],
    }),
    claimStake: builder.mutation<{ success: boolean }, StakeIdBody>({
      query: body => ({ url: 'stakes/claim', method: 'POST', body }),
      // Credits LC yield + writes a STAKE_REWARD LC-ledger row → also refresh the
      // LC transaction history and the wallet.
      invalidatesTags: [
        rtkTags.stakes,
        rtkTags.me,
        rtkTags.lc,
        rtkTags.lcTransactions,
        rtkTags.wallet,
      ],
    }),
  }),
});

export const {
  useGetStakesQuery,
  useStartStakeMutation,
  useCancelStakeMutation,
  useClaimStakeMutation,
} = stakesApi;
