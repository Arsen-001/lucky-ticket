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
    claim: builder.mutation<void, void>({
      query: () => ({
        url: 'referral/claim',
        method: 'POST',
      }),
      invalidatesTags: [rtkTags.referral],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          referralApi.util.updateQueryData('getReferralStats', undefined, draft => {
            draft.availableClaim = 0;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        } finally {
        }
      },
    }),
  }),
});

export const { useGetInvitedFriendsQuery, useGetReferralStatsQuery, useClaimMutation } =
  referralApi;
