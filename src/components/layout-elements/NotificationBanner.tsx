'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { getNotificationTheme } from '@/components/pages/out-tabs/tabs-extra/notifications/notification.theme';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { toInternalRoute } from '@/utils/pages/notification.utils';
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
  const actionRoute = toInternalRoute(notification.actionRoute);

  const handleAction = () => {
    if (!actionRoute) return;
    onDismiss();
    router.push(actionRoute);
  };

  const content = (
    <>
      <p className="truncate text-sm font-extrabold text-white">{notification.title}</p>
      <p className="truncate text-xs text-white/70">{notification.content}</p>
    </>
  );

  return (
    <div
      role="status"
      // `inset-x-0` + `mx-auto max-w-[--app-max-w]`: a fixed box anchors to the
      // WINDOW, not to the app's centred column, so `left-0 right-0` alone made
      // the banner as wide as the browser — measured at 1728px it spilled 649px
      // past the column on each side and floated over the page background. The
      // cap keeps it on the app; on a phone the two edges coincide, which is
      // why this only ever showed up off-device.
      className="animate-slide-in-bottom fixed inset-x-0 z-40 mx-auto max-w-[var(--app-max-w)] px-3"
      // The header is `5rem + --tg-inset-top` tall (see Header.tsx). A fixed
      // `top-20` matches only when Telegram reports no inset — in fullscreen,
      // or on a notched device, the banner slid up under the header.
      style={{ top: 'calc(5rem + var(--tg-inset-top) + 0.5rem)' }}
    >
      <div className="bg-purple-gradient card-outlined flex items-center gap-3 rounded-2xl px-3 py-2.5 shadow-lg">
        <div
          className={twMerge(
            'flex-center h-10 w-10 shrink-0 rounded-full border bg-black/30',
            theme.border
          )}
        >
          <Icon size={20} className={theme.fg} strokeWidth={2.2} />
        </div>

        {actionRoute ? (
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
