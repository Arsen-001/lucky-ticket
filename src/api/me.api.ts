import { api } from '@/api/index.api';
import { profileApi } from '@/api/profile.api';
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
        } catch {
          // The live backend DOES reject (e.g. username too short, email taken) —
          // roll back so the cache never keeps a value the server refused.
          mePatch.undo();
          profilePatch?.undo();
        }
      },
      // `profile` too: the optimistic patch above only syncs `avatar`; other
      // edited fields (username, email) must refetch the profile screen.
      invalidatesTags: [rtkTags.me, rtkTags.profile],
    }),
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
        rtkTags.me,
        rtkTags.profile,
        rtkTags.emailReward,
        rtkTags.lc,
        rtkTags.lcTransactions,
        rtkTags.tickets,
        rtkTags.stars,
        rtkTags.starsTransactions,
      ],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useGetEmailRewardQuery,
  useRequestEmailCodeMutation,
  useConfirmEmailMutation,
} = meApi;
