import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { Ticket } from '@/types/types/ticket.types';

export const ticketsApi = api.injectEndpoints({
  endpoints: builder => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => ({ url: '/tickets' }),
      providesTags: [rtkTags.tickets],
    }),
  }),
});

export const { useGetTicketsQuery } = ticketsApi;
