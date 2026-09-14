import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { AirdropClaimResult, AirdropState } from '@/types/interfaces/airdrop.interfaces';

export const airdropApi = api.injectEndpoints({
  endpoints: builder => ({
    getAirdrop: builder.query<AirdropState, void>({
      query: () => ({ url: 'airdrop' }),
      providesTags: [rtkTags.airdrop],
    }),
    claimAirdrop: builder.mutation<AirdropClaimResult, void>({
      query: () => ({ url: 'airdrop/claim', method: 'POST' }),
      // Баланс TON меняется тем же запросом, поэтому кошелёк инвалидируется
      // вместе с самой наградой — иначе экран кошелька покажет прежнее число.
      invalidatesTags: [rtkTags.airdrop, rtkTags.wallet],
    }),
  }),
});

export const { useGetAirdropQuery, useClaimAirdropMutation } = airdropApi;
