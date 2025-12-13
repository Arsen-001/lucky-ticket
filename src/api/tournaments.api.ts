import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

export const tournamentsApi = api.injectEndpoints({
  endpoints: builder => ({
    getTournaments: builder.query<Tournament[], void>({
      query: () => ({ url: 'tournaments' }),
      providesTags: [rtkTags.tournaments],
    }),
    getTournamentById: builder.query<Tournament, string>({
      query: id => ({ url: `tournaments/${id}` }),
      providesTags: [rtkTags.tournaments],
    }),
  }),
});

export const { useGetTournamentsQuery, useGetTournamentByIdQuery } = tournamentsApi;
