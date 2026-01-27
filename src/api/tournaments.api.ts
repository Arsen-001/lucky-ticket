import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { PersonalTournament, Tournament } from '@/types/interfaces/tournaments.interfaces';

export const tournamentsApi = api.injectEndpoints({
  endpoints: builder => ({
    getTournaments: builder.query<PersonalTournament[], void>({
      query: () => ({ url: 'tournaments' }),
      providesTags: [rtkTags.tournaments],
    }),
    getTopTournaments: builder.query<Tournament[], void>({
      query: () => ({ url: 'topTournaments' }),
      providesTags: [rtkTags.tournaments],
    }),
    getTournamentById: builder.query<Tournament, string>({
      query: id => ({ url: `tournaments/${id}` }),
      providesTags: [rtkTags.tournaments],
    }),
  }),
});

export const { useGetTournamentsQuery, useGetTournamentByIdQuery, useGetTopTournamentsQuery } =
  tournamentsApi;
