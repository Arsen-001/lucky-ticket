import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import type { BuyGiftResponse, GiftShopState } from '@/types/interfaces/gift.interfaces';

export const giftsApi = api.injectEndpoints({
  endpoints: builder => ({
    getGiftShop: builder.query<GiftShopState, void>({
      query: () => ({ url: 'market/gifts' }),
      providesTags: [rtkTags.giftShop],
    }),

    buyGift: builder.mutation<BuyGiftResponse, { giftId: string }>({
      query: ({ giftId }) => ({
        url: 'market/gifts/buy',
        method: 'POST',
        body: { giftId },
      }),
      // The shop itself too: a purchase moves both the monthly budget and this
      // player's own allowance, so the counter that was open a second ago may
      // legitimately be shut now.
      invalidatesTags: [rtkTags.giftShop, ...balanceTags.lc],
    }),
  }),
});

export const { useGetGiftShopQuery, useBuyGiftMutation } = giftsApi;
