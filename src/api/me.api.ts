import { api } from '@/api/index.api';
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
        try {
          dispatch(
            meApi.util.updateQueryData('getMe', undefined, draft => {
              Object.assign(draft, body);
            })
          );
          await queryFulfilled;
        } catch {
          // patchResult.undo();
        }
      },
      // invalidatesTags: [rtkTags.me],
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation } = meApi;
