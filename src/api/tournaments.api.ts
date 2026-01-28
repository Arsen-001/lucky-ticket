import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  PersonalTournament,
  Tournament,
  TournamentPlacesResponse,
} from '@/types/interfaces/tournaments.interfaces';

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
    getTournamentById: builder.query<PersonalTournament, string>({
      query: id => ({ url: `tournaments/${id}` }),
      providesTags: [rtkTags.tournaments],
    }),
    getTournamentPlaces: builder.query<TournamentPlacesResponse, string>({
      query: id => ({ url: `tournaments/${id}/places` }),
      providesTags: [rtkTags.tournaments],
    }),
  }),
});

export const {
  useGetTournamentsQuery,
  useGetTournamentByIdQuery,
  useGetTopTournamentsQuery,
  useGetTournamentPlacesQuery,
} = tournamentsApi;
