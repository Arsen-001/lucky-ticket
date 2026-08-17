import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import type { RouletteSpinResult, RouletteState } from '@/types/interfaces/roulette.interfaces';

export const rouletteApi = api.injectEndpoints({
  endpoints: builder => ({
    getRoulette: builder.query<RouletteState, void>({
      query: () => ({ url: 'games/roulette' }),
      providesTags: [rtkTags.roulette],
    }),

    /**
     * Spend one spin.
     *
     * Invalidates far more than the roulette because a prize is real money on
     * real balances: LC, Stars, AP and tickets all land in the same transaction
     * as the spin — with a ledger row for each — and a screen still holding the
     * old numbers is how a player concludes the prize never arrived.
     *
     * `referral` rides along too — the spin ladder counts qualifying friends,
     * so the invite screen's own numbers move with it.
     */
    spinRoulette: builder.mutation<RouletteSpinResult, void>({
      query: () => ({ url: 'games/roulette/spin', method: 'POST' }),
      invalidatesTags: [
        rtkTags.roulette,
        rtkTags.tickets,
        rtkTags.referral,
        ...balanceTags.lc,
        ...balanceTags.stars,
      ],
    }),
  }),
});

export const { useGetRouletteQuery, useSpinRouletteMutation } = rouletteApi;
