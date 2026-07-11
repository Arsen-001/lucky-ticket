import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  InvitedFriend,
  PreparedShareMessage,
  ReferralStats,
} from '@/types/interfaces/referral.interfaces';
import type { LocaleType } from '@/types/types/locale.types';

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
    // No cache tags: the prepared message is single-use and cache-irrelevant —
    // a fresh one is created on every share tap.
    prepareShareMessage: builder.mutation<PreparedShareMessage, { lang: LocaleType }>({
      query: ({ lang }) => ({
        url: 'referral/prepare-share',
        method: 'POST',
        body: { lang },
      }),
    }),
    claimFriend: builder.mutation<void, { friendId: string }>({
      query: ({ friendId }) => ({
        url: `referral/claim/${friendId}`,
        method: 'POST',
      }),
      invalidatesTags: [rtkTags.referral, rtkTags.tickets, rtkTags.me],
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

export const {
  useGetInvitedFriendsQuery,
  useGetReferralStatsQuery,
  useClaimFriendMutation,
  usePrepareShareMessageMutation,
} = referralApi;
