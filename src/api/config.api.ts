import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { PublicConfig } from '@/types/interfaces/config.interfaces';

export const configApi = api.injectEndpoints({
  endpoints: builder => ({
    getPublicConfig: builder.query<PublicConfig, void>({
      query: () => ({ url: 'config' }),
      providesTags: [rtkTags.platformConfig],
    }),
  }),
});

export const { useGetPublicConfigQuery } = configApi;
