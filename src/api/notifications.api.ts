import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import { type Notification } from '@/types/interfaces/notifications.interfaces';

export const notificationsApi = api.injectEndpoints({
  endpoints: builder => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => ({ url: 'notifications' }),
      providesTags: [rtkTags.notifications],
    }),
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: 'notifications/mark-all-as-read',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, draft => {
            draft.forEach(notification => {
              notification.read = true;
            });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [rtkTags.notifications],
    }),
    markAsRead: builder.mutation<void, string>({
      query: id => ({
        url: `notifications/${id}/mark-as-read`,
        method: 'POST',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', undefined, draft => {
            const notification = draft.find(n => n.id === id);
            if (notification) {
              notification.read = true;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [rtkTags.notifications],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAllAsReadMutation, useMarkAsReadMutation } =
  notificationsApi;
