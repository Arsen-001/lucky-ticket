import { api } from '@/api/index.api';
import { profileApi } from '@/api/profile.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { MeResponse } from '@/types/interfaces/user.interfaces';

export const meApi = api.injectEndpoints({
  endpoints: builder => ({
    getMe: builder.query<MeResponse, void>({
      query: () => ({ url: 'me' }),
      providesTags: [rtkTags.me],
    }),
    updateMe: builder.mutation<MeResponse, Partial<MeResponse>>({
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
  }),
});

export const { useGetMeQuery, useUpdateMeMutation } = meApi;
