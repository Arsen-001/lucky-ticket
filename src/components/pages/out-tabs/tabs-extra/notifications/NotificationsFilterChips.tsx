'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { getNotificationTheme } from './notification.theme';
import type {
  NotificationsFilter,
  NotificationType,
} from '@/types/interfaces/notifications.interfaces';

export interface NotificationsFilterChipsProps {
  active: NotificationsFilter;
  onChange: (next: NotificationsFilter) => void;
  counts: Partial<Record<NotificationsFilter, number>>;
  visibleTypes: NotificationType[];
}

export function NotificationsFilterChips({
  active,
  onChange,
  counts,
  visibleTypes,
}: NotificationsFilterChipsProps) {
  const t = useAppTranslations();

  const items: { key: NotificationsFilter; label: string }[] = [
    { key: 'all', label: t('all') },
    { key: 'unread', label: t('unread') },
    ...visibleTypes.map(type => ({
      key: type as NotificationsFilter,
      label: t(getNotificationTheme(type).labelKey),
    })),
  ];

  return (
    <div className="scrollbar-hidden -mx-1 flex gap-2 overflow-x-auto px-1">
      {items.map(({ key, label }) => {
        const isActive = active === key;
        const count = counts[key] ?? 0;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(key)}
            className={twMerge(
              'inline-flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              isActive
                ? 'border-electric-pink/50 bg-electric-pink/15 text-white'
                : 'text-pink-secondary border-white/10 bg-white/5 hover:bg-white/10'
            )}
          >
            <span>{label}</span>
            <span
              className={twMerge(
                'rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums',
                isActive ? 'bg-electric-pink/25 text-white' : 'bg-white/10 text-white/70'
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
