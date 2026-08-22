import { api } from '@/api/index.api';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { AppDispatch } from '@/lib/rtk/store';
import type {
  DuelInvite,
  DuelInviteCandidate,
  DuelLobbyList,
  DuelMove,
  DuelState,
} from '@/types/interfaces/duel.interfaces';

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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        seedDuelState(dispatch, data);
      },
    }),

    cancelDuel: builder.mutation<{ ok: boolean }, string>({
      query: id => ({ url: `games/duel/${id}`, method: 'DELETE' }),
      invalidatesTags: [rtkTags.duelLobbies],
    }),

    joinDuel: builder.mutation<DuelState, string>({
      query: id => ({ url: `games/duel/${id}/join`, method: 'POST' }),
      invalidatesTags: [rtkTags.duelLobbies],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        seedDuelState(dispatch, data);
      },
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

    /** Кого можно позвать — с пометкой, дойдёт ли до человека сообщение. */
    getDuelInviteCandidates: builder.query<DuelInviteCandidate[], void>({
      query: () => ({ url: 'games/duel/invite-candidates' }),
    }),

    /**
     * Вызовы, ждущие ответа прямо сейчас.
     *
     * Опрашивается редко и вне игры: это фон, а не игровой цикл. Тому, кто уже
     * в приложении, вызов показывается модалкой — DM доходит до единиц
     * процентов, и надеяться только на него нельзя.
     */
    getDuelInvites: builder.query<DuelInvite[], void>({
      query: () => ({ url: 'games/duel/invites' }),
      providesTags: [rtkTags.duelInvites],
    }),

    /** Отказ — чтобы вызов не всплывал снова. */
    declineDuelInvite: builder.mutation<{ ok: boolean }, string>({
      query: id => ({ url: `games/duel/invites/${id}/decline`, method: 'POST' }),
      invalidatesTags: [rtkTags.duelInvites],
    }),

    /**
     * Позвать выбранных в своё лобби.
     *
     * Ответ разделяет четыре факта, и каждому нужны свои слова на экране:
     * `invited` — скольким вызов дошёл в игру, `sent` — скольким ушло ещё и
     * письмо (бот не может написать первым, так что это меньшее число),
     * `refused` — скольким отказала их настройка «кто может меня звать»,
     * `unavailable` — кому игра пока не открыта стадией выката.
     */
    inviteToDuel: builder.mutation<
      { invited: number; sent: number; refused: number; unavailable: number },
      { id: string; userIds: string[] }
    >({
      query: ({ id, userIds }) => ({
        url: `games/duel/${id}/invite`,
        method: 'POST',
        body: { userIds },
      }),
    }),
  }),
});

/**
 * Ответ «создать» и «войти» — это уже готовое состояние матча. Кладём его в
 * кеш `getDuelState` сразу: иначе арена, открывшись, секунду стоит пустой,
 * пока не придёт первый опрос — и это ровно тот момент, когда игрок только
 * что нажал кнопку и смотрит, сработала ли она.
 */
function seedDuelState(dispatch: AppDispatch, state: DuelState) {
  dispatch(duelApi.util.upsertQueryData('getDuelState', state.id, state));
}

export const {
  useGetDuelLobbiesQuery,
  useGetDuelStateQuery,
  useCreateDuelMutation,
  useCancelDuelMutation,
  useJoinDuelMutation,
  useReadyDuelMutation,
  useMoveDuelMutation,
  useGetDuelInviteCandidatesQuery,
  useGetDuelInvitesQuery,
  useDeclineDuelInviteMutation,
  useInviteToDuelMutation,
} = duelApi;
