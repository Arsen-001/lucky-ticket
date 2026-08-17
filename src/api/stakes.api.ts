import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import type {
  CancelStakeResult,
  ClaimStakeResult,
  StakeIdBody,
  StakesData,
  StartStakeBody,
  StartStakeResult,
} from '@/types/interfaces/stakes.interfaces';

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
    claimStake: builder.mutation<ClaimStakeResult, StakeIdBody>({
      query: body => ({ url: 'stakes/claim', method: 'POST', body }),
      // Pays the LC yield and the completion stars, with a ledger row on each.
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
  }),
});

export const {
  useGetStakesQuery,
  useStartStakeMutation,
  useCancelStakeMutation,
  useClaimStakeMutation,
} = stakesApi;
