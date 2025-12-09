import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { MeResponse } from '@/types/interfaces/user.interfaces';

export const meApi = api.injectEndpoints({
  endpoints: builder => ({
    getMe: builder.query<MeResponse, void>({
      query: () => ({ url: 'me' }),
      providesTags: [rtkTags.me],
    }),
  }),
});

export const { useGetMeQuery } = meApi;
