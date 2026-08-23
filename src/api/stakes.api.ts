import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import type { AppDispatch } from '@/lib/rtk/store';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import type {
  CancelStakeResult,
  ClaimStakeResult,
  StakeIdBody,
  StakesData,
  StartStakeBody,
  StartStakeResult,
} from '@/types/interfaces/stakes.interfaces';

/**
 * Everything one stake claim moves: the stakes screen, the task chain that
 * counts stakes, and BOTH currency groups — a completed stake pays LC yield and
 * completion stars, with a ledger row on each. @see balanceTags
 */
export const stakeClaimTags = [
  rtkTags.stakes,
  rtkTags.tasks,
  ...balanceTags.lc,
  ...balanceTags.stars,
];

export const stakesApi = api.injectEndpoints({
  endpoints: builder => ({
    getStakes: builder.query<StakesData, void>({
      query: () => ({ url: 'stakes' }),
      providesTags: [rtkTags.stakes],
    }),
    startStake: builder.mutation<StartStakeResult, StartStakeBody>({
      query: body => ({ url: 'stakes/start', method: 'POST', body }),
      // Locks LC *and* charges a star fee (which writes a STAKE_FEE row on the
      // Stars ledger) → both currency groups, not just the header.
      invalidatesTags: [rtkTags.stakes, rtkTags.tasks, ...balanceTags.lc, ...balanceTags.stars],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Stakes are counted twice by the 31-day checklist — «make your first
          // stake» (lifetime) and «hold N active stakes» (live) — and by the
          // stake task chain. Opening, cancelling and claiming all move one of
          // them, so all three refresh both surfaces at the moment of the act.
          refetchTestQuestProgress(dispatch);
        } catch {
          // Refused: nothing moved.
        }
      },
    }),
    cancelStake: builder.mutation<CancelStakeResult, StakeIdBody>({
      query: body => ({ url: 'stakes/cancel', method: 'POST', body }),
      // Returns the LC principal and charges a star cancel fee → same two groups.
      invalidatesTags: [rtkTags.stakes, rtkTags.tasks, ...balanceTags.lc, ...balanceTags.stars],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Stakes are counted twice by the 31-day checklist — «make your first
          // stake» (lifetime) and «hold N active stakes» (live) — and by the
          // stake task chain. Opening, cancelling and claiming all move one of
          // them, so all three refresh both surfaces at the moment of the act.
          refetchTestQuestProgress(dispatch);
        } catch {
          // Refused: nothing moved.
        }
      },
    }),
    /**
     * Collect one matured stake.
     *
     * `silent` suppresses this claim's cache work, and exists for «Забрать все
     * готовые»: there is no bulk endpoint, so that button is one of these PER
     * STAKE. Each carries the heaviest tag set in the app — stakes, tasks, both
     * currency groups — plus a forced test-quest refetch, so ten ready stakes
     * meant ten POSTs dragging some forty GETs behind them, every answer
     * superseded by the next claim. The batch does that work once, at the end.
     * @see refreshAfterStakeClaims
     */
    claimStake: builder.mutation<ClaimStakeResult, StakeIdBody & { silent?: boolean }>({
      // `silent` is stripped from the body on purpose: the backend validates
      // with `forbidNonWhitelisted`, so an extra field is a 400, not a no-op.
      query: ({ silent: _silent, ...body }) => ({ url: 'stakes/claim', method: 'POST', body }),
      // Pays the LC yield and the completion stars, with a ledger row on each.
      invalidatesTags: (_result, _error, { silent }) => (silent ? [] : stakeClaimTags),
      async onQueryStarted({ silent }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Stakes are counted twice by the 31-day checklist — «make your first
          // stake» (lifetime) and «hold N active stakes» (live) — and by the
          // stake task chain. Opening, cancelling and claiming all move one of
          // them, so all three refresh both surfaces at the moment of the act.
          if (!silent) refetchTestQuestProgress(dispatch);
        } catch {
          // Refused: nothing moved.
        }
      },
    }),
  }),
});

/**
 * Refresh everything a BATCH of stake claims moved — once, after the last one
 * has settled. The companion to `claimStake({ silent: true })`.
 *
 * Runs from a `finally`: a batch that threw half-way has still paid out the
 * claims that went through, and leaving those unrefreshed is the disagreement
 * `balanceTags` exists to prevent.
 */
export const refreshAfterStakeClaims = (dispatch: AppDispatch) => {
  dispatch(api.util.invalidateTags(stakeClaimTags));
  refetchTestQuestProgress(dispatch);
};

export const {
  useGetStakesQuery,
  useStartStakeMutation,
  useCancelStakeMutation,
  useClaimStakeMutation,
} = stakesApi;
