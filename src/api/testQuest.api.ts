import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import type { AppDispatch } from '@/lib/rtk/store';
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

/**
 * Pull fresh `stepProgress` after an action the quest counts but does not own.
 *
 * The checklist's live counters are derived from five places, none of which the
 * quest's own endpoints write: ads off `AdWatchProgress.lifetimeWatched`,
 * tickets spent off tournament entries + `profile.ticketsSent`, engine upgrades
 * off the ENGINE_UPGRADE Stars rows, shares and referrals off the two `User`
 * counters. So every mutation behind one of those calls this.
 *
 * A forced refetch rather than `invalidatesTags: [rtkTags.testQuest]`, for the
 * reason spelled out over `refetchTournamentProgress`: invalidation EVICTS an
 * entry that has no live subscriber, and the next visit to the quest screen then
 * replays the whole skeleton. `initiate(…, { forceRefetch: true })` writes the
 * response into the existing entry instead, so the numbers change under a screen
 * that never blinks.
 *
 * What it buys is narrow but real: `useTestQuestScreen` already refetches on
 * every mount, so a stale number never lasts — but without this the refetch only
 * STARTS when the player opens the screen, and the first paint shows the
 * pre-action count for as long as the request takes. Starting it at the moment
 * of the action means the screen opens already correct.
 */
export const refetchTestQuestProgress = (dispatch: AppDispatch) => {
  dispatch(
    testQuestApi.endpoints.getTestQuest.initiate(undefined, {
      subscribe: false,
      forceRefetch: true,
    })
  );
};

export const {
  useGetTestQuestQuery,
  useGetTestQuestLeaderboardQuery,
  useClaimTestQuestLevelMutation,
  useRecheckChannelSubscriptionMutation,
} = testQuestApi;
