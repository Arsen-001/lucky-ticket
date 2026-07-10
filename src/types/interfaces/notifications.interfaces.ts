import type { Route } from '@/constants/routes';

export type NotificationType =
  | 'tournament'
  | 'task'
  | 'reward'
  | 'friend'
  | 'stake'
  | 'leaderboard'
  | 'system';

export type NotificationDisplayMode = 'feed' | 'banner' | 'modal';

export interface Notification {
  id: string;
  title: string;
  content: string;
  read: boolean;
  date: string;
  type?: NotificationType;
  actionRoute?: Route;
  /** How prominently the notification surfaces on app open. Defaults to 'feed'. */
  displayMode?: NotificationDisplayMode;
}

export type NotificationChannel = 'email' | 'telegram';

export type NotificationPreferenceKey =
  | 'tournamentStart'
  | 'tournamentEnd'
  | 'stake'
  | 'system'
  | 'gifts';

export type NotificationPreferences = Record<
  NotificationChannel,
  Record<NotificationPreferenceKey, boolean>
>;
