import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { LeaderboardResponse } from '@/types/interfaces/leaderboard.interfaces';

export const leaderboardApi = api.injectEndpoints({
  endpoints: builder => ({
    getLeaderboard: builder.query<LeaderboardResponse, void>({
      query: () => ({ url: 'leaderboard' }),
      providesTags: [rtkTags.leaderboard],
    }),
  }),
});

export const { useGetLeaderboardQuery } = leaderboardApi;
