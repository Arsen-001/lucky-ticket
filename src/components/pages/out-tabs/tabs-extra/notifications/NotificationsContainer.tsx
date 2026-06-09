'use client';

import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import { useMemo, useState } from 'react';
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
} from '@/api/notifications.api';
import { Notification, NotificationType } from '@/types/interfaces/notifications.interfaces';
import { NotificationCard } from './NotificationCard';
import { NotificationsHeroCard } from './NotificationsHeroCard';
import { NotificationsFilterChips, type NotificationsFilter } from './NotificationsFilterChips';
import { NotificationModal } from '@/components/shared/modals/NotificationModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  getNotificationsGroupTitle,
  getNotificationsSkeletonData,
  groupNotificationsByDate,
} from '@/utils/pages/notification.utils';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export function NotificationsContainer() {
  const t = useAppTranslations();
  const { data: notifications, isLoading, isError, refetch } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationsFilter>('all');

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const total = notifications?.length ?? 0;
  const unread = notifications?.filter(n => !n.read).length ?? 0;

  const visibleTypes = useMemo<NotificationType[]>(() => {
    if (!notifications?.length) return [];
    const set = new Set<NotificationType>();
    for (const n of notifications) {
      if (n.type) set.add(n.type);
    }
    return Array.from(set);
  }, [notifications]);

  const counts = useMemo<Partial<Record<NotificationsFilter, number>>>(() => {
    const result: Partial<Record<NotificationsFilter, number>> = {
      all: total,
      unread,
    };
    for (const type of visibleTypes) {
      result[type] = notifications?.filter(n => n.type === type).length ?? 0;
    }
    return result;
  }, [notifications, total, unread, visibleTypes]);

  const filtered = useMemo(() => {
    if (!notifications) return [];
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === filter);
  }, [notifications, filter]);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const groupedNotifications = groupNotificationsByDate(filtered);
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
        onMarkAllAsRead={() => markAllAsRead()}
        isMarkingAll={isMarkingAll}
      />

      {!isLoading && total > 0 && (
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
            <div key={groupIndex} className="flex flex-col gap-2">
              <SkeletonSuspense
                loading={isLoading}
                skeleton={<Skeleton variant="line" textSize="xs" className="w-32" />}
              >
                <h3
                  className="text-pink-secondary ml-1 animate-slide-in-bottom text-[10px] font-bold uppercase tracking-widest"
                  style={{ animationDelay: `${groupOffset * 60}ms` }}
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

      <NotificationModal
        notification={selectedNotification}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
