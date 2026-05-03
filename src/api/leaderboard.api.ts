import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  LeaderboardPeriod,
  LeaderboardResponse,
} from '@/types/interfaces/leaderboard.interfaces';

export const leaderboardApi = api.injectEndpoints({
  endpoints: builder => ({
    getLeaderboard: builder.query<LeaderboardResponse, LeaderboardPeriod>({
      query: period => ({ url: `leaderboard/${period}` }),
      providesTags: [rtkTags.leaderboard],
      keepUnusedDataFor: 60,
    }),
  }),
});

export const { useGetLeaderboardQuery, useLazyGetLeaderboardQuery } = leaderboardApi;
