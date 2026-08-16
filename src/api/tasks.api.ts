import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  BuyExtraAdViewsRequest,
  BuyExtraAdViewsResponse,
  ClaimTaskRequest,
  ClaimTaskResponse,
  TaskReward,
  TasksResponse,
} from '@/types/interfaces/tasks.interfaces';
import type { AdProviderId } from '@/lib/ads/types';

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
 * POST /tasks/claim  body: { id, subStepIds? }
 *   Claims a task or sub-step, optionally bundling completed-but-unclaimed
 *   sub-step rewards into the same response. Server should:
 *     • Validate user owns the task and it's claimable
 *     • Mark the task / sub-steps as claimed
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
 *   `src/lib/ads/`). `provider` reports which network served it — including
 *   `house`, the app's own promo shown when every network was empty, which is
 *   unpaid and may carry a different reward.
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
      // `provider` tells the backend which network served the impression —
      // it prices a house ad differently and attributes revenue per network.
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
  }),
});

export const {
  useGetTasksQuery,
  useClaimTaskMutation,
  useWatchAdMutation,
  useReportAdAttemptMutation,
  useBuyExtraAdViewsMutation,
} = tasksApi;
