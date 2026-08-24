import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
import { profileApi } from '@/api/profile.api';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  ConfirmEmailResponse,
  EmailRewardInfo,
  MeResponse,
  RequestEmailCodeResponse,
} from '@/types/interfaces/user.interfaces';

export const meApi = api.injectEndpoints({
  endpoints: builder => ({
    getMe: builder.query<MeResponse, void>({
      query: () => ({ url: 'me' }),
      providesTags: [rtkTags.me],
    }),
    // `email` is deliberately not part of the payload: the backend refuses it on
    // PATCH /me, because the address is an identity claim (it is what the admin
    // panel logs in with). It changes only through the verified code flow below.
    updateMe: builder.mutation<MeResponse, Omit<Partial<MeResponse>, 'email'>>({
      query: body => ({
        url: 'me',
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const { avatar } = body;
        const mePatch = dispatch(
          meApi.util.updateQueryData('getMe', undefined, draft => {
            Object.assign(draft, body);
          })
        );
        // The profile page renders its avatar from a separate query — keep it in sync.
        const profilePatch = avatar
          ? dispatch(
              profileApi.util.updateQueryData('getProfile', undefined, draft => {
                draft.avatar = avatar;
              })
            )
          : null;
        try {
          await queryFulfilled;
          // Setting a nickname is a task (`has_username`) AND a step of the
          // 31-day checklist. Both counted the change server-side and neither
          // was told about it, so the player renamed themselves and both
          // screens went on showing the step undone.
          refetchTestQuestProgress(dispatch);
        } catch {
          // The live backend DOES reject (e.g. username too short, email taken) —
          // roll back so the cache never keeps a value the server refused.
          mePatch.undo();
          profilePatch?.undo();
        }
      },
      // `profile` too: the optimistic patch above only syncs `avatar`; other
      // edited fields (username, email) must refetch the profile screen.
      invalidatesTags: [rtkTags.me, rtkTags.profile, rtkTags.tasks],
    }),
    /**
     * The returning player has been told why their account is empty.
     *
     * Optimistic, and deliberately not gated on the response: the modal closes
     * on the tap either way, and a failed ack simply shows it once more on the
     * next launch — which is the harmless direction to fail in.
     */
    ackWipeNotice: builder.mutation<{ wipeNotice: boolean }, void>({
      query: () => ({ url: 'me/wipe-notice', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          meApi.util.updateQueryData('getMe', undefined, draft => {
            draft.wipeNotice = false;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    /**
     * Ответ игрока на нативный попап «разрешить боту писать» — сразу на сервер.
     *
     * `allows_write_to_pm` приезжает в ПОДПИСАННОЙ initData, а она обновляется
     * только при следующем запуске мини-аппа. То есть без этого вызова человек,
     * разрешивший переписку минуту назад, до конца сессии числится
     * недостижимым — и именно сейчас, пока он в игре, мимо него проходят вызов
     * на дуэль и напоминание о двигателе.
     *
     * Кэш `me` не инвалидируем: поля `botWriteAllowed` в ответе `me` нет, а
     * лишний рефетч на ровном месте моргает скелетами.
     */
    setBotWriteAccess: builder.mutation<{ botWriteAllowed: boolean }, { allowed: boolean }>({
      query: body => ({ url: 'me/write-access', method: 'POST', body }),
    }),
    // EMAIL OFF (2026-08-17) — the three endpoints below are left wired on
    // purpose: nothing routed calls them any more (the screen is parked at
    // settings/_email and every entry point into it is commented out), so they
    // cost nothing standing here, and keeping them means the revival is two
    // folder renames plus uncommenting — no re-plumbing of tags, mocks and
    // types. Grep `EMAIL OFF`.
    //
    // The gift composition is admin-configured — the settings screen reads it
    // from the backend instead of a hardcoded constant.
    getEmailReward: builder.query<EmailRewardInfo, void>({
      query: () => ({ url: 'me/email/reward' }),
      providesTags: [rtkTags.emailReward],
    }),
    requestEmailCode: builder.mutation<RequestEmailCodeResponse, { email: string }>({
      query: body => ({ url: 'me/email/request-code', method: 'POST', body }),
    }),
    confirmEmail: builder.mutation<ConfirmEmailResponse, { code: string }>({
      query: body => ({ url: 'me/email/confirm', method: 'POST', body }),
      // Confirming writes the address AND may credit the gift — refresh every
      // balance it can touch (same set as the promo redeem).
      invalidatesTags: [
        rtkTags.profile,
        rtkTags.emailReward,
        rtkTags.tickets,
        ...balanceTags.lc,
        ...balanceTags.stars,
      ],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useAckWipeNoticeMutation,
  useSetBotWriteAccessMutation,
  useGetEmailRewardQuery,
  useRequestEmailCodeMutation,
  useConfirmEmailMutation,
} = meApi;
