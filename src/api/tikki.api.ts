import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { meApi } from '@/api/me.api';
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
 *
 * Исключение одно — тап: он повторяется десятками раз подряд, и его новый
 * баланс переписывается в кэш руками, без единого лишнего запроса. Почему это
 * не нарушает правило выше — в комментарии у самой мутации.
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
     * Тап — единственная мутация, которую повторяют десятками подряд, поэтому
     * здесь не инвалидируется НИЧЕГО, даже `me`. Ответ на тап несёт `balance`
     * — это и есть `user.coins`, то же число, что печатает шапка, — и оно
     * кладётся в кэш `me` напрямую. Инвалидация означала бы второй запрос за
     * числом, которое уже пришло: до 11.09.2026 на каждую пачку летел ещё и
     * `GET /me`, то есть на главном экране запросов было вдвое больше, а
     * цифра в шапке отставала от цифры на сцене на целый круг до сервера.
     *
     * Это не предсказание: тап двигает на сервере только `coins` (плюс
     * счётчики нажатий, которых в `me` нет), так что скопировать его ответ
     * достаточно. Ленту LC не трогаем и подавно — сервер склеивает нажатия в
     * одну строку за пять минут, и история досчитается при заходе на неё.
     */
    tapTikki: builder.mutation<TikkiState, TikkiTapBody>({
      query: body => ({ url: 'tikki/tap', method: 'POST', body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(tikkiApi.util.upsertQueryData('getTikki', undefined, data));
          dispatch(
            meApi.util.updateQueryData('getMe', undefined, draft => {
              draft.coins = data.balance;
            })
          );
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
