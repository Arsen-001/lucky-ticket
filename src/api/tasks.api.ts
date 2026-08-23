import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  AdsExtraQuote,
  BuyExtraAdViewsRequest,
  BuyExtraAdViewsResponse,
  ClaimTaskRequest,
  ClaimTaskResponse,
  TaskReward,
  TasksResponse,
} from '@/types/interfaces/tasks.interfaces';
import type { AdProviderId } from '@/lib/ads/types';
import { markAdViewSpent } from '@/utils/pages/ad-slots.utils';

/**
 * Tasks API — endpoints consumed by the Tasks page.
 *
 * Backend contract (when replacing the mock):
 *
 * GET /tasks
 *   Returns the full TasksResponse for the current authenticated user.
 *   The server is the source of truth for:
 *     • task.status (LOCKED / IN_PROGRESS / READY_TO_CLAIM / COMPLETED)
 *     • task.unlockHint (when LOCKED — short reason like "Reach Silver tier")
 *     • task.progress.{current,target}
 *     • task.subSteps[i].{completed,claimed} (real per-substep state)
 *     • Master "Complete all available tournament tasks" — aggregated
 *       progress + substeps per user-unlocked tier
 *     • VIP "Reach X tier" tasks — COMPLETED if user reached tier,
 *       IN_PROGRESS for the immediate next tier, LOCKED for further tiers
 *     • ads.slots[i].watched flags + watchedToday counter
 *     • streak / dailyProgress aggregates
 *
 * POST /tasks/claim  body: { id }
 *   Claims a task — the whole task, once. Sub-steps are a progress checklist
 *   and pay nothing of their own (the server sends every one of them
 *   `claimable: false`), so there is nothing to bundle. Server should:
 *     • Validate user owns the task and it's claimable
 *     • Mark the task as claimed
 *     • Apply rewards to user balance
 *     • Return ClaimTaskResponse with the rewards granted + new balance
 *   The frontend invalidates `rtkTags.tasks` here, so the UI auto-refetches
 *   `getTasks` and reflects the new state. No optimistic-update hacks needed.
 *
 * POST /tasks/ads/watch  body: { adId }
 *   Records that the user finished watching the ad and grants slot rewards.
 *   Server should mark the slot watched and apply the reward.
 *   Frontend invalidates `rtkTags.tasks` so the AdsSlider reflects the
 *   updated `watched` flag and the next unwatched slot becomes active.
 *
 *   Ad delivery: the client plays a real rewarded ad through the provider
 *   waterfall and only POSTs here after a genuine completion (see
 *   `src/lib/ads/`). `provider` reports which network served it — always a real
 *   network: an empty waterfall grants nothing at all.
 *   Until an account qualifies for a network's server-to-server reward
 *   callback the watch is client-attested. Once S2S is enabled, treat that
 *   callback (Adsgram: GET ?userid=<telegramId>; Monetag: postback with
 *   `ymid`) as the authoritative "ad watched" signal — grant the reward there
 *   and enforce the daily cap server-side, so a spoofed POST without a
 *   matching callback grants nothing. See `DOCS/ADS_SETUP.md`.
 */
export const tasksApi = api.injectEndpoints({
  endpoints: builder => ({
    getTasks: builder.query<TasksResponse, void>({
      query: () => ({ url: 'tasks' }),
      providesTags: [rtkTags.tasks],
    }),
    claimTask: builder.mutation<ClaimTaskResponse, ClaimTaskRequest>({
      query: body => ({ url: 'tasks/claim', method: 'POST', body }),
      // A task reward can pay LC, Lucky Stars and tickets in one claim, each with
      // its own ledger row — refresh both currency groups plus the ticket balance.
      invalidatesTags: [rtkTags.tasks, rtkTags.tickets, ...balanceTags.lc, ...balanceTags.stars],
    }),
    watchAd: builder.mutation<
      { adId: string; rewards: TaskReward[] },
      // `provider` tells the backend which network served the impression, so
      // revenue is attributed per network.
      // Optional so an older client (or the dev mock flow) still works.
      //
      // `skipped` claims the Lucky Player skip: no ad played, pay the view
      // anyway (DOCS §7.3). The server re-derives the allowance and refuses a
      // claim it did not grant, so this is a request, not an instruction —
      // and `provider` is meaningless alongside it (there was no impression).
      { adId: string; provider?: AdProviderId; skipped?: boolean }
    >({
      query: body => ({ url: 'tasks/ads/watch', method: 'POST', body }),
      // Same three payouts as a task claim (LC / Stars / tickets, ledger rows
      // included) — `me` + `lc` alone left the ad reward missing from both
      // histories and from the ticket balance.
      invalidatesTags: [rtkTags.tasks, rtkTags.tickets, ...balanceTags.lc, ...balanceTags.stars],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // A paid view moves `lifetimeWatched`, which is what the test-quest's
        // «посмотри N реклам» step counts. Only after the server confirms — a
        // refused claim moves nothing.
        try {
          await queryFulfilled;
          // Spend the view in the cache too. The invalidation below refetches
          // `tasks`, but that is a round trip, and until it lands the card
          // still offers the skip this call just used — see `markAdViewSpent`
          // for what that cost in production.
          dispatch(
            tasksApi.util.updateQueryData('getTasks', undefined, draft => {
              markAdViewSpent(draft.ads, { adId: arg.adId, skipped: arg.skipped });
            })
          );
          refetchTestQuestProgress(dispatch);
        } catch {
          /* the caller surfaces the failure; nothing was counted */
        }
      },
    }),
    /**
     * POST /tasks/ads/attempt  body: { provider, outcome, adId? }
     *   Telemetry for an attempt that paid nothing — the player closed the ad
     *   early, no network had one, or playback failed. Grants nothing and
     *   consumes no daily slot, so it invalidates no cache: fire and forget.
     *
     *   It exists because a network counts an impression the moment its ad
     *   renders. A closed ad is still an impression to them and used to be
     *   nothing at all to us, which is why their impression count runs ahead of
     *   ours with no stored reason. See `DOCS/ADS_SETUP.md`.
     */
    reportAdAttempt: builder.mutation<
      { status: string },
      { provider: AdProviderId; outcome: 'skipped' | 'noAd' | 'tooFast' | 'error' }
    >({
      query: body => ({ url: 'tasks/ads/attempt', method: 'POST', body }),
    }),
    /**
     * POST /tasks/ads/extra  body: { count, currency }
     *   Buys extra ad slots for the rest of the UTC day once the free cap is
     *   spent. Charges LC or Lucky Stars at the admin-set price and returns the
     *   new ceiling. Unwatched bought slots expire with the day — the UI says
     *   so before the player pays.
     */
    buyExtraAdViews: builder.mutation<BuyExtraAdViewsResponse, BuyExtraAdViewsRequest>({
      query: body => ({ url: 'tasks/ads/extra', method: 'POST', body }),
      // Charges LC *or* Lucky Stars (the caller picks `currency`) and writes the
      // matching ledger row, so both groups refresh alongside the ads block.
      invalidatesTags: [rtkTags.tasks, ...balanceTags.lc, ...balanceTags.stars],
    }),
    /**
     * GET /tasks/ads/extra/quote?count=N
     *   What buying N more views right now would cost and pay. Read-only, and
     *   the only correct source of that total: the paid ladder climbs, so the
     *   app must never quote `one view × N` on its own.
     *
     *   The currency is part of the question, not just of the price: views
     *   bought with Stars are paid from their own ladder, so quoting without it
     *   would show the LC payout beside a Stars price.
     *
     *   Tagged `tasks` so a purchase re-quotes — the next view bought after
     *   this one starts a rung further up the ladder.
     */
    quoteExtraAdViews: builder.query<AdsExtraQuote, { count: number; currency: 'lc' | 'ls' }>({
      query: ({ count, currency }) => ({
        url: 'tasks/ads/extra/quote',
        params: { count, currency },
      }),
      providesTags: [rtkTags.tasks],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useClaimTaskMutation,
  useWatchAdMutation,
  useReportAdAttemptMutation,
  useBuyExtraAdViewsMutation,
  useQuoteExtraAdViewsQuery,
} = tasksApi;
