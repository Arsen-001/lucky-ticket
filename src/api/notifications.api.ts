import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import {
  NOTIFICATION_PSEUDO_FILTERS,
  NOTIFICATION_TYPES,
  NOTIFICATIONS_PAGE_SIZE,
} from '@/constants/notifications.constants';
import type {
  NotificationsFilter,
  NotificationsPage,
  NotificationsSummary,
} from '@/types/interfaces/notifications.interfaces';

/**
 * Every filter the feed can be cached under.
 *
 * Marking a notification read has to reach the page the user is looking at
 * *and* every other filter already in the cache — switching from All back to
 * Unread must not show a row that was just read as unread again. Patching a
 * cache entry that does not exist is a no-op, so walking the full list is both
 * correct and cheap.
 */
const ALL_FILTERS: NotificationsFilter[] = [...NOTIFICATION_PSEUDO_FILTERS, ...NOTIFICATION_TYPES];

export const notificationsApi = api.injectEndpoints({
  endpoints: builder => ({
    /**
     * Cursor-paginated feed. The inbox grows by a row per tournament a player
     * enters, so it long outlives any fixed ceiling — pages are the only shape
     * that keeps a year-old notification reachable.
     */
    getNotificationsFeed: builder.infiniteQuery<
      NotificationsPage,
      NotificationsFilter,
      string | null
    >({
      infiniteQueryOptions: {
        initialPageParam: null,
        // `undefined` — not `null` — is what tells RTK there is no next page.
        getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
      },
      query: ({ queryArg, pageParam }) => ({
        url: 'notifications/feed',
        params: {
          filter: queryArg,
          limit: NOTIFICATIONS_PAGE_SIZE,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
      }),
      providesTags: [rtkTags.notifications],
    }),

    /** Counts for the header badge, the hero card and the chip counters. */
    getNotificationsSummary: builder.query<NotificationsSummary, void>({
      query: () => ({ url: 'notifications/summary' }),
      providesTags: [rtkTags.notifications],
    }),

    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: 'notifications/mark-all-as-read',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patches = [
          ...ALL_FILTERS.map(filter =>
            dispatch(
              notificationsApi.util.updateQueryData('getNotificationsFeed', filter, draft => {
                for (const page of draft.pages)
                  for (const notification of page.items) notification.read = true;
              })
            )
          ),
          dispatch(
            notificationsApi.util.updateQueryData('getNotificationsSummary', undefined, draft => {
              draft.unread = 0;
            })
          ),
        ];
        try {
          await queryFulfilled;
        } catch {
          patches.forEach(patch => patch.undo());
        }
      },
      // No `invalidatesTags`: the optimistic patch already mirrors the exact
      // server change, so invalidating only buys a redundant refetch of every
      // loaded page, for every subscriber (header badge, drawer, feed).
    }),

    markAsRead: builder.mutation<void, string>({
      query: id => ({
        url: `notifications/${id}/mark-as-read`,
        method: 'POST',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // Only the caches that actually held the row as unread may decrement
        // the badge — otherwise a double tap would count twice.
        let wasUnread = false;
        const patches = ALL_FILTERS.map(filter =>
          dispatch(
            notificationsApi.util.updateQueryData('getNotificationsFeed', filter, draft => {
              for (const page of draft.pages) {
                const notification = page.items.find(n => n.id === id);
                if (notification && !notification.read) {
                  wasUnread = true;
                  notification.read = true;
                }
              }
            })
          )
        );
        if (wasUnread) {
          patches.push(
            dispatch(
              notificationsApi.util.updateQueryData('getNotificationsSummary', undefined, draft => {
                draft.unread = Math.max(0, draft.unread - 1);
              })
            )
          );
        }
        try {
          await queryFulfilled;
        } catch {
          patches.forEach(patch => patch.undo());
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsFeedInfiniteQuery,
  useGetNotificationsSummaryQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} = notificationsApi;
