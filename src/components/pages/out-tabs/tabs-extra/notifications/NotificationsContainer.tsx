'use client';

import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { useMemo, useState } from 'react';
import {
  useGetNotificationsFeedInfiniteQuery,
  useGetNotificationsSummaryQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '@/api/notifications.api';
import { NOTIFICATION_TYPES } from '@/constants/notifications.constants';
import type {
  Notification,
  NotificationsFilter,
  NotificationType,
} from '@/types/interfaces/notifications.interfaces';
import { NotificationCard } from './NotificationCard';
import { NotificationsHeroCard } from './NotificationsHeroCard';
import { NotificationsFilterChips } from './NotificationsFilterChips';
import { NotificationsLoadMore } from './NotificationsLoadMore';
import { NotificationModal } from '@/components/shared/modals/NotificationModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import {
  getNotificationsGroupTitle,
  getNotificationsSkeletonData,
  groupNotificationsByDate,
} from '@/utils/pages/notification.utils';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { staggerMs } from '@/utils/global/animation.utils';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export function NotificationsContainer() {
  const t = useAppTranslations();
  const toast = useToast();
  const [filter, setFilter] = useState<NotificationsFilter>('all');
  // Counts describe the WHOLE inbox and the feed describes one filter's pages —
  // two queries because a paginated list cannot answer "how many are there".
  const { data: summary, isLoading: isSummaryLoading } = useGetNotificationsSummaryQuery();
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetNotificationsFeedInfiniteQuery(filter);
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const notifications = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data]);

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (notification.read) return;
    try {
      await markAsRead(notification.id).unwrap();
    } catch {
      // The optimistic patch has already rolled back — say so, otherwise the
      // row silently flips back to unread and reads as a UI glitch.
      toast.error(t('action failed'));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch {
      toast.error(t('action failed'));
    }
  };

  const total = summary?.total ?? 0;
  const unread = summary?.unread ?? 0;

  // Fixed order, not order-of-appearance: the chips must not reshuffle under
  // the finger when a filter loads a different slice of the inbox.
  const visibleTypes = useMemo<NotificationType[]>(
    () => NOTIFICATION_TYPES.filter(type => (summary?.byType[type] ?? 0) > 0),
    [summary]
  );

  const counts = useMemo<Partial<Record<NotificationsFilter, number>>>(
    () => ({ all: total, unread, ...summary?.byType }),
    [summary, total, unread]
  );

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const groupedNotifications = groupNotificationsByDate(notifications);
  const content = isLoading ? getNotificationsSkeletonData(2, 2) : groupedNotifications;
  const contentEntries = Object.entries(content);
  const contentExists = !!contentEntries.length;

  let runningIndex = 0;
  const groupAnimationIndexes = contentEntries.map(([, items]) => {
    const headerIndex = runningIndex;
    runningIndex += items.length + 1;
    return headerIndex;
  });

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <NotificationsHeroCard
        total={total}
        unread={unread}
        onMarkAllAsRead={handleMarkAllAsRead}
        isMarkingAll={isMarkingAll}
      />

      {!isSummaryLoading && total > 0 && (
        <NotificationsFilterChips
          active={filter}
          onChange={setFilter}
          counts={counts}
          visibleTypes={visibleTypes}
        />
      )}

      {contentExists ? (
        contentEntries.map(([date, groupNotifications], groupIndex) => {
          const groupOffset = groupAnimationIndexes[groupIndex];
          return (
            <div key={date} className="flex flex-col gap-2">
              <SkeletonSuspense
                loading={isLoading}
                skeleton={<Skeleton variant="line" textSize="xs" className="w-32" />}
              >
                <h3
                  className="text-pink-secondary ms-1 animate-slide-in-bottom text-[10px] font-bold uppercase tracking-widest"
                  style={{ animationDelay: `${staggerMs(groupOffset)}ms` }}
                >
                  {getNotificationsGroupTitle(date, t)}
                </h3>
              </SkeletonSuspense>
              <div className="flex flex-col gap-2">
                {groupNotifications.map((notification, cardIndex) => (
                  <NotificationCard
                    loading={isLoading}
                    key={isLoading ? cardIndex : (notification as Notification).id}
                    notification={notification as Notification}
                    onClick={handleNotificationClick}
                    index={groupOffset + cardIndex + 1}
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : !isLoading ? (
        <EmptyDataInfo
          className="mt-6"
          title={filter === 'unread' ? t('all caught up') : t('no notifications')}
          description={filter === 'unread' ? t('no unread') : undefined}
        />
      ) : null}

      {hasNextPage && !isLoading && (
        <NotificationsLoadMore onLoadMore={() => fetchNextPage()} loading={isFetchingNextPage} />
      )}

      <NotificationModal
        notification={selectedNotification}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
