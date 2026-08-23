import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import { serverReadyAt } from '@/utils/global/ticket-engine.utils';
import type { Ticket } from '@/types/types/ticket.types';

export const ticketsApi = api.injectEndpoints({
  endpoints: builder => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => ({ url: '/tickets' }),
      /**
       * Pin the server's countdown to this device's clock the moment it lands.
       *
       * The payload carries `secondsRemaining` — how long the SERVER says each
       * cycle still has. Every screen recomputes readiness locally between
       * requests, and when the two disagreed the local answer won on screen and
       * lost at the server: «Забрать» appeared early and the tap came back 400,
       * which players read as «Не удалось забрать награду». `readyAt` is the
       * floor those checks now sit on (@see isEngineReady). An older payload
       * without `secondsRemaining` simply keeps the old behaviour.
       */
      transformResponse: (tickets: Ticket[]) => {
        const now = Date.now();
        return tickets.map(ticket =>
          ticket.engines?.length
            ? {
                ...ticket,
                engines: ticket.engines.map(engine =>
                  typeof engine.secondsRemaining === 'number'
                    ? { ...engine, readyAt: serverReadyAt(engine.secondsRemaining, now) }
                    : engine
                ),
              }
            : ticket
        );
      },
      providesTags: [rtkTags.tickets],
    }),
  }),
});

export const { useGetTicketsQuery } = ticketsApi;
