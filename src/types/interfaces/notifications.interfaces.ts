import type { Route } from '@/constants/routes';

export type NotificationType =
  | 'tournament'
  | 'task'
  | 'reward'
  | 'friend'
  | 'stake'
  | 'leaderboard'
  | 'system';

export interface Notification {
  id: string;
  title: string;
  content: string;
  read: boolean;
  date: string;
  type?: NotificationType;
  actionRoute?: Route;
}
