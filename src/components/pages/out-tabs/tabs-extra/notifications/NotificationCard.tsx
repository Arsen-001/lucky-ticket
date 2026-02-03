'use client';

import { Notification } from '@/types/interfaces/notifications.interfaces';
import { twMerge } from 'tailwind-merge';
import { formatDate } from '@/utils/global/date.utils';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

interface NotificationCardProps {
  notification: Notification;
  loading?: boolean;
  onClick: (notification: Notification) => void;
}

export function NotificationCard({ notification, loading, onClick }: NotificationCardProps) {
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div
        className={twMerge(
          'absolute top-0 bottom-0 left-0 w-4 bg-pink transition-all',
          notification?.read && '-left-4'
        )}
      />

      <div
        className={twMerge(
          'relative shadow bg-purple-gradient rounded-[inherit] px-4 py-3 flex flex-col gap-1 cursor-pointer transition-all',
          !notification?.read && 'translate-x-1'
        )}
        onClick={() => !loading && onClick(notification)}
      >
        <div className="flex justify-between items-start gap-2">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="base" className="w-3/4" />}
          >
            <h4
              className={twMerge(
                'font-bold text-base',
                !notification?.read ? 'text-white' : 'text-white/80'
              )}
            >
              {notification?.title}
            </h4>
          </SkeletonSuspense>

          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="xs" className="w-7" />}
          >
            <span className="text-xs text-white/40 whitespace-nowrap pt-1">
              {notification?.date && formatDate(notification.date, 'HH:mm')}
            </span>
          </SkeletonSuspense>
        </div>

        <SkeletonSuspense
          loading={loading}
          skeleton={
            <Skeleton
              variant="text"
              lines={2}
              classNames={{ textLine: 'h-4.75' }}
              className="w-full gap-0.5"
            />
          }
        >
          <p className="text-white/60 text-sm line-clamp-2">{notification?.content}</p>
        </SkeletonSuspense>
      </div>
    </div>
  );
}
