import type { NotificationPreferences } from '@/types/interfaces/notifications.interfaces';

const preferences: NotificationPreferences = {
  email: {
    tournamentStart: true,
    tournamentEnd: true,
    stake: true,
    system: true,
    gifts: true,
  },
  telegram: {
    tournamentStart: true,
    tournamentEnd: true,
    stake: true,
    system: true,
    gifts: true,
  },
};

export const notificationPreferencesMock = {
  'notification-preferences': preferences,
  'PATCH notification-preferences': preferences,
};
