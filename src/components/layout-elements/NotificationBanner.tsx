'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { getNotificationTheme } from '@/components/pages/out-tabs/tabs-extra/notifications/notification.theme';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { Notification } from '@/types/interfaces/notifications.interfaces';

interface NotificationBannerProps {
  notification: Notification;
  onDismiss: () => void;
}

export function NotificationBanner({ notification, onDismiss }: NotificationBannerProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const theme = getNotificationTheme(notification.type);
  const Icon = theme.icon;

  const handleAction = () => {
    if (!notification.actionRoute) return;
    onDismiss();
    router.push(notification.actionRoute);
  };

  const content = (
    <>
      <p className="truncate text-sm font-extrabold text-white">{notification.title}</p>
      <p className="truncate text-xs text-white/70">{notification.content}</p>
    </>
  );

  return (
    <div className="animate-slide-in-bottom fixed left-0 right-0 top-20 z-40 px-3">
      <div className="bg-purple-gradient card-outlined flex items-center gap-3 rounded-2xl px-3 py-2.5 shadow-lg">
        <div
          className={twMerge(
            'flex-center h-10 w-10 shrink-0 rounded-full border bg-black/30',
            theme.border
          )}
        >
          <Icon size={20} className={theme.fg} strokeWidth={2.2} />
        </div>

        {notification.actionRoute ? (
          <button type="button" onClick={handleAction} className="min-w-0 flex-1 text-left">
            {content}
          </button>
        ) : (
          <div className="min-w-0 flex-1">{content}</div>
        )}

        <button
          type="button"
          onClick={onDismiss}
          aria-label={t('close')}
          className="flex-center h-8 w-8 shrink-0 rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
