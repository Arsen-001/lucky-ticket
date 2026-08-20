import type { NotificationPreferences } from '@/types/interfaces/notifications.interfaces';

// One channel muted here on purpose: the settings screen has to look right with
// a mixed state, and every-toggle-on hides an inverted switch.
const preferences: NotificationPreferences = {
  email: {
    tournamentStart: true,
    tournamentEnd: true,
    invites: true,
    stake: true,
    engines: true,
    gifts: true,
    friends: true,
    achievements: false,
    system: true,
  },
  telegram: {
    tournamentStart: true,
    tournamentEnd: true,
    invites: true,
    stake: true,
    engines: true,
    gifts: true,
    friends: true,
    achievements: true,
    system: true,
  },
  // Значение по умолчанию: вызовы открыты всем, сузить можно в настройках.
  duelInvitesFrom: 'everyone',
};

export const notificationPreferencesMock = {
  'notification-preferences': preferences,
  'PATCH notification-preferences': preferences,
};
