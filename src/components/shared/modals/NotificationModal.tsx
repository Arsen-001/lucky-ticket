'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatDate } from '@/utils/global/date.utils';
import { formatRelativeTime, toInternalRoute } from '@/utils/pages/notification.utils';
import { getNotificationTheme } from '@/components/pages/out-tabs/tabs-extra/notifications/notification.theme';
import type { Notification } from '@/types/interfaces/notifications.interfaces';

interface NotificationModalProps {
  notification: Notification | null;
  open: boolean;
  onClose: () => void;
}

export function NotificationModal({ notification, open, onClose }: NotificationModalProps) {
  const t = useAppTranslations();
  const router = useRouter();

  const theme = getNotificationTheme(notification?.type);
  const Icon = theme.icon;
  const actionRoute = toInternalRoute(notification?.actionRoute);

  const handleAction = () => {
    if (!actionRoute) return;
    onClose();
    router.push(actionRoute);
  };

  return (
    <Modal open={open} onClose={onClose} label={notification?.title}>
      <div className="bg-purple-gradient relative overflow-hidden rounded-2xl">
        <div className={`relative px-6 pt-7 pb-5 text-center ${theme.bg}`}>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl"
          />
          <div
            className={`flex-center mx-auto h-14 w-14 rounded-full border ${theme.border} bg-black/30`}
          >
            <Icon size={26} className={theme.fg} strokeWidth={2.2} />
          </div>
          <span
            className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${theme.bg} ${theme.fg}`}
          >
            {t(theme.labelKey)}
          </span>
        </div>

        <div className="relative flex flex-col gap-3 px-6 pt-4 pb-5 text-center">
          <h3 className="text-lg font-extrabold leading-snug text-white">{notification?.title}</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">
            {notification?.content}
          </p>
          {notification?.date && (
            <span className="text-pink-secondary text-[11px] font-semibold tabular-nums">
              {formatRelativeTime(notification.date, t)} · {formatDate(notification.date)}
            </span>
          )}
        </div>

        {actionRoute && (
          <div className="border-t border-white/8 px-6 py-3">
            <Button
              variant="primary"
              onClick={handleAction}
              icon={<ChevronRight />}
              iconPosition="right"
              iconSize={16}
              className="h-10 w-full rounded-xl py-0 text-sm font-extrabold"
            >
              {t(theme.actionLabelKey)}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
