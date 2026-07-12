import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { TermsOfUse } from '@/types/interfaces/terms.interfaces';

export const termsApi = api.injectEndpoints({
  endpoints: builder => ({
    getTermsOfUse: builder.query<TermsOfUse, void>({
      query: () => ({ url: 'terms' }),
      providesTags: [rtkTags.terms],
    }),
  }),
});

export const { useGetTermsOfUseQuery } = termsApi;
