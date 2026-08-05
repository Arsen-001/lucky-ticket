import dayjs from 'dayjs';
import { englishMonthKey } from '@/lib/dayjs/locale';
import type { Route } from '@/constants/routes';
import type { Dictionary, MessageIds } from '@/types/types/i18n.types';
import type { Notification } from '@/types/interfaces/notifications.interfaces';

/** Day key for the older-than-yesterday groups — one header per calendar day. */
const DAY_KEY_FORMAT = 'YYYY-MM-DD';

/**
 * `actionRoute` is free text an admin types into the panel, so it reaches the
 * app unvalidated. Only an in-app absolute path may be handed to `router.push`:
 * a protocol-relative `//host` or an absolute URL would navigate the Mini App
 * off-platform, and anything else (a bare word, `javascript:`) is a dead link
 * dressed up as a working button.
 */
export const toInternalRoute = (value?: string): Route | undefined =>
  value && value.startsWith('/') && !value.startsWith('//') ? (value as Route) : undefined;

export const formatRelativeTime = (iso: string, t: Dictionary, now = Date.now()) => {
  const ago = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (ago < 60) return t('just now');
  if (ago < 3600) return t('{n}m ago', { n: Math.floor(ago / 60) });
  if (ago < 86400) return t('{n}h ago', { n: Math.floor(ago / 3600) });
  return t('{n}d ago', { n: Math.floor(ago / 86400) });
};

export function getNotificationsSkeletonData(
  keysCount: number,
  arrayLength: number
): Record<string, object[]> {
  const result: Record<string, object[]> = {};

  for (let i = 1; i <= keysCount; i++) {
    result[i] = Array.from({ length: arrayLength }, () => ({}));
  }

  return result;
}

export const groupNotificationsByDate = (notifications?: Notification[]) => {
  if (!notifications) return {};

  return notifications.reduce(
    (groups: Record<string, Notification[]>, notification): Record<MessageIds, Notification[]> => {
      const date = dayjs(notification.date);
      let groupKey: string;

      if (date.isToday()) {
        groupKey = 'today';
      } else if (date.isYesterday()) {
        groupKey = 'yesterday';
      } else {
        // Calendar day, NOT the full timestamp: keying by `toISOString()` made
        // every older notification its own group, so a real feed rendered one
        // repeated date header per row. The mocks hid it — their fixtures share
        // a single Date object, which real `createdAt` values never do.
        groupKey = date.format(DAY_KEY_FORMAT);
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
      return groups;
    },
    {}
  );
};

export const getNotificationsGroupTitle = (date: string | undefined, t: Dictionary) => {
  if (date === 'today') return t('today');
  if (date === 'yesterday') return t('yesterday');
  // Only a day key produced above is a date. The skeleton groups are keyed "1",
  // "2" — and `dayjs('1')` is a *valid* date (2001-01-01), so a loose check
  // would print a real-looking header for placeholder rows.
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return '';
  const dateObject = dayjs(date);
  if (!dateObject.isValid()) return '';
  // English on purpose — this is the translation key, not the visible month.
  const month = englishMonthKey(dateObject) as MessageIds;
  return `${dateObject.format('DD')} ${t(month)} ${dateObject.format('YYYY')}`;
};
