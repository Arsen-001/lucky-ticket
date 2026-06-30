import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { PromoRedeemResponse } from '@/types/interfaces/promo.interfaces';

export const promoApi = api.injectEndpoints({
  endpoints: builder => ({
    redeemPromoCode: builder.mutation<PromoRedeemResponse, { code: string }>({
      query: body => ({ url: 'promo/redeem', method: 'POST', body }),
      // A successful redemption credits the player — refresh the balances it can
      // touch, including the LC ledger row it writes (PROMO credit).
      invalidatesTags: [rtkTags.me, rtkTags.lc, rtkTags.lcTransactions, rtkTags.tickets],
    }),
  }),
});

export const { useRedeemPromoCodeMutation } = promoApi;
