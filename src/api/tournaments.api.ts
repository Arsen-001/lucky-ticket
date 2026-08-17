import { api } from '@/api/index.api';
import { tasksApi } from '@/api/tasks.api';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { AppDispatch } from '@/lib/rtk/store';
import type {
  CreateSponsoredTournamentPayload,
  CreateSponsoredTournamentResponse,
  PersonalTournament,
  Tournament,
  TournamentPlacesResponse,
} from '@/types/interfaces/tournaments.interfaces';

export interface JoinTournamentRequest {
  tournamentId: string;
  ticketsCount: number;
}

export interface JoinTournamentResponse {
  participatedTicketsCount: number;
  remainingTickets: number;
}

/**
 * Patch one tournament in place across every cache that may hold it (catalog
 * list + detail). Tournament mutations must NOT blanket-invalidate
 * `rtkTags.tournaments`: invalidating the tag while the list screen is
 * unmounted drops its cache entry, so the next visit re-runs the full skeleton
 * load and the whole page visibly blinks. Returns the patch handles so
 * optimistic callers can undo on error.
 */
const patchTournamentCaches = (
  dispatch: AppDispatch,
  tournamentId: string,
  patch: (tournament: PersonalTournament) => void
) => [
  dispatch(
    tournamentsApi.util.updateQueryData('getTournaments', undefined, draft => {
      const tournament = draft.find(item => item.id === tournamentId);
      if (tournament) patch(tournament);
    })
  ),
  dispatch(
    tournamentsApi.util.updateQueryData('getTournamentById', tournamentId, draft => {
      patch(draft);
    })
  ),
];

/**
 * Pull the screens that count tournament entries back from the server.
 *
 * Entering advances real state the client can't derive: the backend bumps every
 * TOURNAMENTS-category task on a first entry (`earn.onTournamentJoin`), and the
 * counter-driven ones — including the test-quest card pinned to the same Tasks
 * screen, which sums entered tickets — recompute on every entry. Nothing on the
 * client refetched either, so the tasks screen kept its pre-join numbers until
 * the app was restarted: the player entered a tournament and the task still
 * read "0/4".
 *
 * Refetched, not invalidated. `invalidatesTags` REMOVES an entry that has no
 * subscriber, and the tournament detail page lives in `(out-tabs)`, outside the
 * tab bar that holds the only always-mounted `getTasks` subscription — so
 * joining from there would evict the cache and make the next visit to /tasks
 * replay the full skeleton (the same trap this file avoids for
 * `rtkTags.tournaments`). A forced refetch writes the fresh response into the
 * existing entry instead: subscribers keep their data on screen while it lands.
 */
const refetchTournamentProgress = (dispatch: AppDispatch) => {
  dispatch(
    tasksApi.endpoints.getTasks.initiate(undefined, { subscribe: false, forceRefetch: true })
  );
  // Entering spends tickets, and «потрать N билетов» counts them.
  refetchTestQuestProgress(dispatch);
};

export const tournamentsApi = api.injectEndpoints({
  endpoints: builder => ({
    getTournaments: builder.query<PersonalTournament[], void>({
      query: () => ({ url: 'tournaments' }),
      providesTags: [rtkTags.tournaments],
      // Stale-while-revalidate: keep the list long enough to survive a detour
      // through a detail page (default 60s eviction meant coming back later
      // re-ran the full skeleton load). Freshness comes from the list screen's
      // `refetchOnMountOrArgChange`, which refetches in the background.
      keepUnusedDataFor: 600,
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
    joinTournament: builder.mutation<JoinTournamentResponse, JoinTournamentRequest>({
      query: body => ({ url: 'tournaments/join', method: 'POST', body }),
      // `me` (AP) and `tickets` (balance) genuinely change server-side; the
      // tournament itself is patched in place below instead of invalidated.
      invalidatesTags: [rtkTags.me, rtkTags.tickets],
      async onQueryStarted({ tournamentId }, { dispatch, queryFulfilled }) {
        // Pessimistic patch: wait for the server's authoritative ticket count,
        // then update caches in place — no refetch, no skeleton flash.
        try {
          const { data } = await queryFulfilled;
          patchTournamentCaches(dispatch, tournamentId, tournament => {
            // "Seats taken" counts distinct participants, not tickets: the
            // viewer's FIRST entry takes a seat, adding more tickets to a
            // tournament already joined does not. Without this the card kept
            // showing the pre-join number until something refetched the list,
            // so joining looked like it hadn't registered.
            if (!tournament.participated && tournament.participantsCount != null)
              tournament.participantsCount += 1;
            tournament.participated = true;
            tournament.participatedTicketsCount = data.participatedTicketsCount;
          });
          // The home slider lists only never-joined tournaments — drop this one.
          dispatch(
            tournamentsApi.util.updateQueryData('getTopTournaments', undefined, draft => {
              const index = draft.findIndex(item => item.id === tournamentId);
              if (index !== -1) draft.splice(index, 1);
            })
          );
          refetchTournamentProgress(dispatch);
        } catch {
          // Join failed — the caller surfaces a toast; caches stay untouched.
        }
      },
    }),
    markTournamentResultSeen: builder.mutation<void, { tournamentId: string }>({
      query: body => ({ url: 'tournaments/result-seen', method: 'POST', body }),
      // Optimistic: the "unseen result" pulse must stop immediately (the UI
      // dispatches this fire-and-forget); undo the patch if the POST fails.
      async onQueryStarted({ tournamentId }, { dispatch, queryFulfilled }) {
        const patches = patchTournamentCaches(dispatch, tournamentId, tournament => {
          tournament.resultSeen = true;
        });
        try {
          await queryFulfilled;
        } catch {
          patches.forEach(patch => patch.undo());
        }
      },
    }),
    createSponsoredTournament: builder.mutation<
      CreateSponsoredTournamentResponse,
      CreateSponsoredTournamentPayload
    >({
      query: body => ({ url: 'tournaments/sponsored', method: 'POST', body }),
      // The advertiser balance is debited server-side; the new tournament is
      // prepended into the cached catalog from the response.
      invalidatesTags: [rtkTags.partnerStats],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            tournamentsApi.util.updateQueryData('getTournaments', undefined, draft => {
              draft.unshift(data.tournament);
            })
          );
        } catch {
          // Creation failed — nothing entered the catalog.
        }
      },
    }),
    approveSponsoredTournament: builder.mutation<{ success: boolean }, { tournamentId: string }>({
      query: body => ({ url: 'tournaments/approve', method: 'POST', body }),
      // moderation → upcoming: the tournament becomes public.
      async onQueryStarted({ tournamentId }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          patchTournamentCaches(dispatch, tournamentId, tournament => {
            tournament.status = 'upcoming';
          });
        } catch {
          // Approval failed — the tournament stays in moderation.
        }
      },
    }),
  }),
});

export const {
  useGetTournamentsQuery,
  useGetTournamentByIdQuery,
  useGetTopTournamentsQuery,
  useGetTournamentPlacesQuery,
  useJoinTournamentMutation,
  useMarkTournamentResultSeenMutation,
  useCreateSponsoredTournamentMutation,
  useApproveSponsoredTournamentMutation,
} = tournamentsApi;
