import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  TikkiBuyBody,
  TikkiIdBody,
  TikkiMergeBody,
  TikkiState,
  TikkiTapBody,
  TikkiUpgradeBody,
} from '@/types/interfaces/tikki.interfaces';

/**
 * Тикки. Каждый ответ — ПОЛНОЕ состояние, поэтому все мутации кладут его в кэш
 * сами: перезапрашивать то, что сервер только что прислал, незачем.
 *
 * Всё, что двигает баланс, инвалидирует ГРУППУ LC целиком, а не один `me`:
 * баланс нарисован в шапке, на своём экране и в истории, и обновить одну из
 * трёх — это «списало дважды» глазами игрока. @see balanceTags
 */
export const tikkiApi = api.injectEndpoints({
  endpoints: builder => ({
    getTikki: builder.query<TikkiState, void>({
      query: () => ({ url: 'tikki' }),
      providesTags: [rtkTags.tikki],
    }),

    /**
     * Нажатия пачкой. Отдача рисуется мгновенно на клиенте, а сюда уходит
     * «нажал N раз» — запрос на каждый тап был бы дороже самого тапа.
     *
     * Ответ кладём в кэш, но НЕ инвалидируем ленту LC: за минуту активной игры
     * это десятки запросов, и каждый тянул бы за собой историю транзакций.
     * Баланс в шапке двигает `me`, а история досчитается при следующем заходе
     * на неё — сервер всё равно склеивает нажатия в одну строку за пять минут.
     */
    tapTikki: builder.mutation<TikkiState, TikkiTapBody>({
      query: body => ({ url: 'tikki/tap', method: 'POST', body }),
      invalidatesTags: [rtkTags.me],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(tikkiApi.util.upsertQueryData('getTikki', undefined, data));
        } catch {
          // Отказ (не хватило, слишком часто) — экран перерисуется следующим
          // ответом; своего состояния у него нет, врать ему нечем.
        }
      },
    }),

    selectTikki: builder.mutation<TikkiState, TikkiIdBody>({
      query: body => ({ url: 'tikki/select', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(tikkiApi.util.upsertQueryData('getTikki', undefined, data));
        } catch {
          /* выбор не сохранился — состояние придёт следующим запросом */
        }
      },
    }),

    upgradeTikki: builder.mutation<TikkiState, TikkiUpgradeBody>({
      query: body => ({ url: 'tikki/upgrade', method: 'POST', body }),
      invalidatesTags: [...balanceTags.lc],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(tikkiApi.util.upsertQueryData('getTikki', undefined, data));
        } catch {
          /* цену считает сервер: отказ означает, что покупки не было */
        }
      },
    }),

    buyTikki: builder.mutation<TikkiState, TikkiBuyBody>({
      query: body => ({ url: 'tikki/buy', method: 'POST', body }),
      invalidatesTags: [...balanceTags.lc],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(tikkiApi.util.upsertQueryData('getTikki', undefined, data));
        } catch {
          /* см. выше */
        }
      },
    }),

    mergeTikki: builder.mutation<TikkiState, TikkiMergeBody>({
      query: body => ({ url: 'tikki/merge', method: 'POST', body }),
      invalidatesTags: [...balanceTags.lc],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(tikkiApi.util.upsertQueryData('getTikki', undefined, data));
        } catch {
          /* см. выше */
        }
      },
    }),
  }),
});

export const {
  useGetTikkiQuery,
  useTapTikkiMutation,
  useSelectTikkiMutation,
  useUpgradeTikkiMutation,
  useBuyTikkiMutation,
  useMergeTikkiMutation,
} = tikkiApi;
