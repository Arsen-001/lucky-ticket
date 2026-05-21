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
        try {
          dispatch(
            meApi.util.updateQueryData('getMe', undefined, draft => {
              Object.assign(draft, body);
            })
          );
          // The profile page renders its avatar from a separate query — keep it in sync.
          if (avatar) {
            dispatch(
              profileApi.util.updateQueryData('getProfile', undefined, draft => {
                draft.avatar = avatar;
              })
            );
          }
          await queryFulfilled;
        } catch {
          // optimistic patches are kept; the mock backend never rejects
        }
      },
      // invalidatesTags: [rtkTags.me],
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation } = meApi;
