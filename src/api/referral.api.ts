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
    claimFriend: builder.mutation<void, { friendId: string }>({
      query: ({ friendId }) => ({
        url: `referral/claim/${friendId}`,
        method: 'POST',
      }),
      invalidatesTags: [rtkTags.referral],
      async onQueryStarted({ friendId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          referralApi.util.updateQueryData('getInvitedFriends', undefined, draft => {
            const friend = draft.find(f => f.id === friendId);
            if (friend) {
              friend.claimableTickets = [];
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useGetInvitedFriendsQuery, useGetReferralStatsQuery, useClaimFriendMutation } =
  referralApi;
