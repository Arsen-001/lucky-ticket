import { api } from '@/api/index.api';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { DuelLobbyList, DuelMove, DuelState } from '@/types/interfaces/duel.interfaces';

/**
 * Дуэль камень-билет-ножницы.
 *
 * Состояние матча опрашивается коротким поллингом: раунд длится пять секунд,
 * и отклик нужен раньше, чем игрок успеет решить, что приложение зависло.
 * Интервал задаёт сам экран — в бою чаще, в лобби реже.
 */
export const duelApi = api.injectEndpoints({
  endpoints: builder => ({
    getDuelLobbies: builder.query<DuelLobbyList, void>({
      query: () => ({ url: 'games/duel/lobbies' }),
      providesTags: [rtkTags.duelLobbies],
    }),

    getDuelState: builder.query<DuelState, string>({
      query: id => ({ url: `games/duel/${id}` }),
      providesTags: (_r, _e, id) => [{ type: rtkTags.duelState, id }],
    }),

    createDuel: builder.mutation<DuelState, { stake: number }>({
      query: body => ({ url: 'games/duel/lobbies', method: 'POST', body }),
      invalidatesTags: [rtkTags.duelLobbies],
    }),

    cancelDuel: builder.mutation<{ ok: boolean }, string>({
      query: id => ({ url: `games/duel/${id}`, method: 'DELETE' }),
      invalidatesTags: [rtkTags.duelLobbies],
    }),

    joinDuel: builder.mutation<DuelState, string>({
      query: id => ({ url: `games/duel/${id}/join`, method: 'POST' }),
      invalidatesTags: [rtkTags.duelLobbies],
    }),

    readyDuel: builder.mutation<DuelState, string>({
      query: id => ({ url: `games/duel/${id}/ready`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: rtkTags.duelState, id }],
    }),

    /**
     * Ход. Билеты двигаются только на финале матча, поэтому здесь
     * инвалидируется вся денежная группа — иначе баланс в шапке отстаёт.
     */
    moveDuel: builder.mutation<DuelState, { id: string; move: DuelMove }>({
      query: ({ id, move }) => ({
        url: `games/duel/${id}/move`,
        method: 'POST',
        body: { move },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: rtkTags.duelState, id }, rtkTags.tickets],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        // Победа кладёт на баланс обе ставки, поражение уносит свою — билеты
        // считает чек-лист тест-квеста, и он должен узнать об этом сразу.
        if (data.status === 'FINISHED') refetchTestQuestProgress(dispatch);
      },
    }),
  }),
});

export const {
  useGetDuelLobbiesQuery,
  useGetDuelStateQuery,
  useCreateDuelMutation,
  useCancelDuelMutation,
  useJoinDuelMutation,
  useReadyDuelMutation,
  useMoveDuelMutation,
} = duelApi;
