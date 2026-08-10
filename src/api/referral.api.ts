import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  BranchMember,
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
    // Who a friend invited in turn. Fetched only when a row is expanded — a
    // branch can be many times the size of the list above it, and almost
    // nobody opens one. The backend refuses for anyone who is not your friend.
    getFriendBranch: builder.query<BranchMember[], { friendId: string }>({
      query: ({ friendId }) => ({ url: `referral/friends/${friendId}/branch` }),
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
    // Records that the user actually SENT a referral share (not just opened the
    // picker). `confirmed` = Telegram `shareMessage` reported sent=true (or the
    // OS share sheet resolved); false = optimistic, from a fallback path that
    // gives no delivery signal. Fire-and-forget — served by POST /referral/shared on the backend.
    markShareSent: builder.mutation<{ ok: boolean }, { confirmed: boolean }>({
      query: ({ confirmed }) => ({
        url: 'referral/shared',
        method: 'POST',
        body: { confirmed },
      }),
      invalidatesTags: [rtkTags.referral],
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
  useGetFriendBranchQuery,
  useGetReferralStatsQuery,
  useClaimFriendMutation,
  usePrepareShareMessageMutation,
  useMarkShareSentMutation,
} = referralApi;
