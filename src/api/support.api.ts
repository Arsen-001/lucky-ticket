import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { SupportArticle, SupportSection } from '@/types/interfaces/support.interfaces';

export const supportApi = api.injectEndpoints({
  endpoints: builder => ({
    getSupportSections: builder.query<SupportSection[], void>({
      query: () => ({ url: 'sections' }),
      providesTags: [rtkTags.support],
    }),
    getSupportArticleById: builder.query<SupportArticle, string>({
      query: id => ({ url: `articles/${id}` }),
      providesTags: [rtkTags.support],
    }),
  }),
});

export const { useGetSupportSectionsQuery, useGetSupportArticleByIdQuery } = supportApi;
