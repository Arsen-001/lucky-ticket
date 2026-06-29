import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { PartnerStats } from '@/types/interfaces/partners.interfaces';

export const partnersApi = api.injectEndpoints({
  endpoints: builder => ({
    getPartnerStats: builder.query<PartnerStats, void>({
      query: () => ({ url: 'partners/stats' }),
      providesTags: [rtkTags.partnerStats],
    }),
  }),
});

export const { useGetPartnerStatsQuery } = partnersApi;
