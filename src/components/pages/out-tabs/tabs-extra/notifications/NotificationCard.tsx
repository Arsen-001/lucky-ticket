'use client';

import type { Notification } from '@/types/interfaces/notifications.interfaces';
import { twMerge } from 'tailwind-merge';
import { formatDate } from '@/utils/global/date.utils';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

interface NotificationCardProps {
  notification: Notification;
  loading?: boolean;
  onClick: (notification: Notification) => void;
  index?: number;
}

export function NotificationCard({
  notification,
  loading,
  onClick,
  index = 0,
}: NotificationCardProps) {
  const isUnread = !notification?.read;

  return (
    <div
      className={twMerge(
        'rounded-xl overflow-hidden shadow animate-slide-in-bottom border-l-[3px]',
        isUnread ? 'border-electric-pink' : 'border-transparent'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="bg-purple-gradient rounded-[inherit] px-4 py-3.5 flex flex-col gap-1.5 cursor-pointer transition-opacity active:opacity-75"
        onClick={() => !loading && onClick(notification)}
      >
        <div className="flex justify-between items-start gap-2">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="base" className="w-3/4" />}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isUnread && <span className="shrink-0 w-2 h-2 rounded-full bg-electric-pink" />}
              <h4
                className={twMerge(
                  'font-bold text-base truncate',
                  isUnread ? 'text-white' : 'text-white/60'
                )}
              >
                {notification?.title}
              </h4>
            </div>
          </SkeletonSuspense>

          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="xs" className="w-7" />}
          >
            <span className="text-xs text-white/40 whitespace-nowrap shrink-0 pt-0.5">
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
          <p
            className={twMerge(
              'text-sm line-clamp-2 leading-relaxed',
              isUnread ? 'text-white/65' : 'text-white/40'
            )}
          >
            {notification?.content}
          </p>
        </SkeletonSuspense>
      </div>
    </div>
  );
}
