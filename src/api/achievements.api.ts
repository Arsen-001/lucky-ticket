import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { AchievementCatalogResponse } from '@/types/interfaces/achievement.interfaces';

export const achievementsApi = api.injectEndpoints({
  endpoints: builder => ({
    getAchievements: builder.query<AchievementCatalogResponse, void>({
      query: () => ({ url: 'achievements' }),
      providesTags: [rtkTags.achievements],
    }),
  }),
});

export const { useGetAchievementsQuery } = achievementsApi;
