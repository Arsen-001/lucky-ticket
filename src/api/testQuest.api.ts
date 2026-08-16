import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  ClaimTestQuestResponse,
  TestQuestLeaderboard,
  TestQuestState,
} from '@/types/interfaces/testQuest.interfaces';

/**
 * Test-Quest API — the pinned launch-quest card on the Tasks screen.
 *
 * GET /test-quest        → current level / task / reward / claimable-today.
 * POST /test-quest/claim → takes the current level, credits the drop, advances
 *                          one step. The one-claim-per-day gate is enforced
 *                          server-side; claiming writes LC/Stars ledger rows, so
 *                          the wallet/me/tickets/lc caches are invalidated too.
 */
export const testQuestApi = api.injectEndpoints({
  endpoints: builder => ({
    getTestQuest: builder.query<TestQuestState, void>({
      query: () => ({ url: 'test-quest' }),
      providesTags: [rtkTags.testQuest],
    }),
    getTestQuestLeaderboard: builder.query<TestQuestLeaderboard, void>({
      query: () => ({ url: 'test-quest/leaderboard' }),
      providesTags: [rtkTags.testQuest],
    }),
    claimTestQuestLevel: builder.mutation<ClaimTestQuestResponse, void>({
      query: () => ({ url: 'test-quest/claim', method: 'POST' }),
      // A level pays LC, Lucky Stars and tickets together, each with its own
      // ledger row — both currency groups plus the ticket balance.
      invalidatesTags: [
        rtkTags.testQuest,
        rtkTags.tickets,
        ...balanceTags.lc,
        ...balanceTags.stars,
      ],
    }),
    // Re-reads the caller's live channel membership (getChatMember) — called
    // after the player taps "subscribe" so the gate can unlock without a reload.
    recheckChannelSubscription: builder.mutation<TestQuestState, void>({
      query: () => ({ url: 'test-quest/check-channel', method: 'POST' }),
      invalidatesTags: [rtkTags.testQuest],
    }),
  }),
});

export const {
  useGetTestQuestQuery,
  useGetTestQuestLeaderboardQuery,
  useClaimTestQuestLevelMutation,
  useRecheckChannelSubscriptionMutation,
} = testQuestApi;
