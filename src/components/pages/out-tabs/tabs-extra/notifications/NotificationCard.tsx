'use client';

import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatRelativeTime, toInternalRoute } from '@/utils/pages/notification.utils';
import { getNotificationTheme } from './notification.theme';
import type { Notification } from '@/types/interfaces/notifications.interfaces';
import { staggerMs } from '@/utils/global/animation.utils';

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
  const t = useAppTranslations();
  const isUnread = !notification?.read;
  const theme = getNotificationTheme(notification?.type);
  const Icon = theme.icon;
  const actionRoute = toInternalRoute(notification?.actionRoute);

  return (
    <button
      type="button"
      onClick={() => !loading && onClick(notification)}
      disabled={loading}
      // The unread state is otherwise only a pink dot and a tinted border.
      aria-label={
        loading
          ? undefined
          : `${isUnread ? t('unread') : t('read')} · ${t(theme.labelKey)} · ${notification?.title}`
      }
      style={{ animationDelay: `${staggerMs(index)}ms` }}
      className={twMerge(
        'group relative flex w-full animate-slide-in-bottom items-start gap-3 rounded-2xl border p-3 text-start transition-all',
        isUnread
          ? 'border-electric-pink/25 bg-electric-pink/5 hover:bg-electric-pink/10'
          : 'bg-background-overlay/50 border-white/5 hover:bg-white/5'
      )}
    >
      <div
        className={twMerge(
          'flex-center relative h-10 w-10 flex-shrink-0 rounded-xl border',
          theme.bg,
          theme.border
        )}
      >
        <Icon size={18} className={theme.fg} strokeWidth={2.2} />
        {isUnread && (
          <span
            aria-hidden
            className="bg-electric-pink absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full"
            style={{ boxShadow: '0 0 6px rgba(222,0,155,0.85)' }}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-2/3" />}
          >
            <span
              className={twMerge(
                'flex-1 truncate text-sm font-bold',
                isUnread ? 'text-white' : 'text-white/70'
              )}
            >
              {notification?.title}
            </span>
          </SkeletonSuspense>
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-10" />}
          >
            <span className="text-pink-secondary flex-shrink-0 text-[10px] font-semibold tabular-nums">
              {notification?.date && formatRelativeTime(notification.date, t)}
            </span>
          </SkeletonSuspense>
        </div>

        <SkeletonSuspense
          loading={loading}
          skeleton={
            <Skeleton
              variant="text"
              lines={2}
              classNames={{ textLine: 'h-3.5' }}
              className="w-full gap-0.5"
            />
          }
        >
          <p
            className={twMerge(
              'line-clamp-2 text-[12px] leading-snug',
              isUnread ? 'text-white/80' : 'text-white/55'
            )}
          >
            {notification?.content}
          </p>
        </SkeletonSuspense>

        <div className="mt-1 flex items-center justify-between gap-2">
          <span
            className={twMerge(
              'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
              theme.bg,
              theme.fg
            )}
          >
            {t(theme.labelKey)}
          </span>
          {!loading && actionRoute && (
            <span className="text-pink-secondary group-hover:text-white inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors">
              {t(theme.actionLabelKey)}
              <ChevronRight size={12} strokeWidth={2.5} />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
