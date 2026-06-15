import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { PrivacyPolicy } from '@/types/interfaces/privacy.interfaces';

export const privacyApi = api.injectEndpoints({
  endpoints: builder => ({
    getPrivacyPolicy: builder.query<PrivacyPolicy, void>({
      query: () => ({ url: 'privacy' }),
      providesTags: [rtkTags.privacy],
    }),
  }),
});

export const { useGetPrivacyPolicyQuery } = privacyApi;
