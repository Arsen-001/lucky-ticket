import dayjs from 'dayjs';
import type { Dictionary, MessageIds } from '@/types/types/i18n.types';
import type { Notification } from '@/types/interfaces/notifications.interfaces';

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
        groupKey = date.toISOString();
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
  else if (date === 'yesterday') return t('yesterday');
  else if (dayjs(date).isValid()) {
    const dateObject = dayjs(date);
    const month = dateObject.format('MMMM').toLowerCase() as MessageIds;
    return `${dateObject.format('DD')} ${t(month)} ${dateObject.format('YYYY')}`;
  }
  return '';
};
