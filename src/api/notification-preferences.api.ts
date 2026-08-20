import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type { NotificationPreferences } from '@/types/interfaces/notifications.interfaces';

export const notificationPreferencesApi = api.injectEndpoints({
  endpoints: builder => ({
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => ({ url: 'notification-preferences' }),
      providesTags: [rtkTags.notificationPreferences],
    }),
    updateNotificationPreferences: builder.mutation<
      NotificationPreferences,
      Partial<NotificationPreferences>
    >({
      query: body => ({
        url: 'notification-preferences',
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationPreferencesApi.util.updateQueryData(
            'getNotificationPreferences',
            undefined,
            draft => {
              if (body.email) Object.assign(draft.email, body.email);
              if (body.telegram) Object.assign(draft.telegram, body.telegram);
              if (body.duelInvitesFrom) draft.duelInvitesFrom = body.duelInvitesFrom;
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const { useGetNotificationPreferencesQuery, useUpdateNotificationPreferencesMutation } =
  notificationPreferencesApi;
