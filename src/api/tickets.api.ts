import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { Ticket } from '@/types/types/ticket.types';

export const ticketsApi = api.injectEndpoints({
  endpoints: builder => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => ({ url: '/tickets' }),
      providesTags: [rtkTags.tickets],
    }),

    getTicketById: builder.query<Ticket, string>({
      query: id => ({ url: `/tickets/${id}` }),
      providesTags: [rtkTags.ticketsById],
    }),
  }),
});

export const { useGetTicketsQuery, useGetTicketByIdQuery } = ticketsApi;
