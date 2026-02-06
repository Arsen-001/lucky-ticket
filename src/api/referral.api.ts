import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { InvitedFriend, ReferralStats } from '@/types/interfaces/referral.interfaces';

export const referralApi = api.injectEndpoints({
  endpoints: builder => ({
    getInvitedFriends: builder.query<InvitedFriend[], void>({
      query: () => ({ url: 'referral/friends' }),
      providesTags: [rtkTags.referral],
    }),
    getReferralStats: builder.query<ReferralStats, void>({
      query: () => ({ url: 'referral/stats' }),
      providesTags: [rtkTags.referral],
    }),
  }),
});

export const { useGetInvitedFriendsQuery, useGetReferralStatsQuery } = referralApi;
