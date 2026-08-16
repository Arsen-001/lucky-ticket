import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import type { PromoRedeemResponse } from '@/types/interfaces/promo.interfaces';

export const promoApi = api.injectEndpoints({
  endpoints: builder => ({
    redeemPromoCode: builder.mutation<PromoRedeemResponse, { code: string }>({
      query: body => ({ url: 'promo/redeem', method: 'POST', body }),
      // A successful redemption credits the player — refresh every balance it can
      // touch, including the LC and Stars ledger rows it writes (PROMO credit).
      invalidatesTags: [rtkTags.tickets, ...balanceTags.lc, ...balanceTags.stars],
    }),
  }),
});

export const { useRedeemPromoCodeMutation } = promoApi;
