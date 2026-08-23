import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { AppDispatch } from '@/lib/rtk/store';
import type {
  BranchMember,
  InvitedFriend,
  PreLaunchGiftState,
  PreparedShareMessage,
  ReferralStats,
} from '@/types/interfaces/referral.interfaces';
import type { LocaleType } from '@/types/types/locale.types';

/**
 * Everything one friend claim moves: the friends list and its stats
 * (`referral`), the legacy ticket commission it pays out (`tickets`) and the
 * whole LC group — a claim writes a REFERRAL ledger row per level, so the
 * header pill alone is not enough. @see balanceTags
 */
export const friendClaimTags = [rtkTags.referral, rtkTags.tickets, ...balanceTags.lc];

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
    // The whole second level, flat — the «Их друзья» tab. One request rather
    // than one per friend, and skipped until that tab is actually opened.
    getReferralNetwork: builder.query<BranchMember[], void>({
      query: () => ({ url: 'referral/network' }),
      providesTags: [rtkTags.referral],
    }),
    /**
     * The «приведи друзей — подарок от бота» event on the friends screen.
     *
     * Every rule it draws lives on the server — the threshold, today's places,
     * whether this player may see the block at all — because all three are
     * panel settings and a screen that decides any of them locally starts
     * promising a promo that is already closed. @see FriendsGiftEventCard
     */
    getPreLaunchGift: builder.query<PreLaunchGiftState, void>({
      query: () => ({ url: 'referral/prelaunch-gift' }),
      providesTags: [rtkTags.referral],
    }),
    /**
     * Ask for the gift — the player pressed it. Nothing files a claim on its
     * own, deliberately: the press is what separates «попросил» from «набрал,
     * но не попросил» for whoever approves the payouts.
     *
     * Invalidates the referral group so the ladder redraws in its new state
     * («заявка ждёт подтверждения») off the server's answer rather than a
     * local guess about what the press did.
     */
    claimPreLaunchGift: builder.mutation<PreLaunchGiftState, void>({
      query: () => ({ url: 'referral/prelaunch-gift/claim', method: 'POST' }),
      invalidatesTags: [rtkTags.referral],
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        // The test-quest's «поделиться с друзьями» step counts these very
        // shares. A forced refetch, not a tag: invalidation would evict the
        // quest cache and make the screen open into skeletons
        // (@see refetchTestQuestProgress).
        try {
          await queryFulfilled;
          refetchTestQuestProgress(dispatch);
        } catch {
          /* the share was not recorded — nothing to refresh */
        }
      },
    }),
    /**
     * Collect one friend's accrued reward.
     *
     * `silent` suppresses this claim's cache invalidation, and exists for
     * «Забрать всё»: that button fires one of these PER FRIEND — there is no
     * bulk endpoint on the backend — and every one of them would otherwise
     * refetch the friends list, the referral stats, the header pill and the
     * whole LC ledger. Ten friends meant ten POSTs and ~30 GETs, each answer
     * thrown away by the next claim's invalidation. The batch invalidates the
     * same tags exactly once, when the last claim has settled.
     * @see refreshAfterFriendClaims
     */
    claimFriend: builder.mutation<void, { friendId: string; silent?: boolean }>({
      query: ({ friendId }) => ({
        url: `referral/claim/${friendId}`,
        method: 'POST',
      }),
      // Collecting a friend pays accrued LC (one REFERRAL ledger row per level)
      // and tickets — the LC group, not just the header pill.
      invalidatesTags: (_result, _error, { silent }) => (silent ? [] : friendClaimTags),
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

/**
 * Refresh everything a BATCH of friend claims moved — once, after the last one
 * has settled. The companion to `claimFriend({ silent: true })`.
 *
 * Runs from a `finally`, deliberately: a batch that threw half-way has still
 * moved money on the server for the claims that did go through, and leaving
 * those unrefreshed is the exact disagreement `balanceTags` exists to prevent.
 */
export const refreshAfterFriendClaims = (dispatch: AppDispatch) => {
  dispatch(api.util.invalidateTags(friendClaimTags));
};

export const {
  useGetInvitedFriendsQuery,
  useGetPreLaunchGiftQuery,
  useClaimPreLaunchGiftMutation,
  useGetFriendBranchQuery,
  useGetReferralNetworkQuery,
  useGetReferralStatsQuery,
  useClaimFriendMutation,
  usePrepareShareMessageMutation,
  useMarkShareSentMutation,
} = referralApi;
