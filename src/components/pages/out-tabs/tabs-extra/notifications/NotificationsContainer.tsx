'use client';

import { useState } from 'react';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '@/api/notifications.api';
import { Notification } from '@/types/interfaces/notifications.interfaces';
import { NotificationCard } from './NotificationCard';
import { NotificationModal } from '@/components/shared/modals/NotificationModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import {
  getNotificationsGroupTitle,
  getNotificationsSkeletonData,
  groupNotificationsByDate,
} from '@/utils/pages/notification.utils';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export function NotificationsContainer() {
  const t = useAppTranslations();
  const { data: notifications, isLoading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  const content = isLoading ? getNotificationsSkeletonData(3, 2) : groupedNotifications;
  const contentExists = !!Object.keys(content).length;

  return (
    <div className="flex flex-col gap-6">
      {contentExists ? (
        Object.entries(content)?.map(([date, notifications], index) => (
          <div key={index} className="flex flex-col gap-3">
            <SkeletonSuspense
              loading={isLoading}
              skeleton={<Skeleton variant="line" textSize="xs" className="w-40" />}
            >
              <h3 className="text-gray-secondary text-sm font-bold uppercase tracking-wider ml-1">
                {getNotificationsGroupTitle(date, t)}
              </h3>
            </SkeletonSuspense>
            <div className="flex flex-col gap-2">
              {notifications?.map((notification, index) => (
                <NotificationCard
                  loading={isLoading}
                  key={index}
                  notification={notification as Notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="flex-center flex-col py-20 text-white/40">
          <EmptyDataInfo description={t('no notifications')} />
        </div>
      )}

      <NotificationModal
        notification={selectedNotification}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
