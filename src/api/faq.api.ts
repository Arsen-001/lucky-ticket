import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { FaqArticle, FaqSection } from '@/types/interfaces/faq.interfaces';

export const faqApi = api.injectEndpoints({
  endpoints: builder => ({
    getFaqSections: builder.query<FaqSection[], void>({
      query: () => ({ url: 'sections' }),
      providesTags: [rtkTags.faq],
    }),
    getFaqArticleById: builder.query<FaqArticle, string>({
      query: id => ({ url: `articles/${id}` }),
      providesTags: [rtkTags.faq],
    }),
  }),
});

export const { useGetFaqSectionsQuery, useGetFaqArticleByIdQuery } = faqApi;
