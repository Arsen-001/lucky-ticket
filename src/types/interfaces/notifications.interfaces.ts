import type { Route } from '@/constants/routes';
import type {
  NOTIFICATION_PSEUDO_FILTERS,
  NOTIFICATION_TYPES,
} from '@/constants/notifications.constants';

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** What the chips filter by — server-side, so it is part of the request. */
export type NotificationsFilter = (typeof NOTIFICATION_PSEUDO_FILTERS)[number] | NotificationType;

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

/** One page of the feed, as `GET /notifications/feed` returns it. */
export interface NotificationsPage {
  items: Notification[];
  /** Id to continue from, or `null` on the last page. */
  nextCursor: string | null;
}

/**
 * Whole-inbox counts. Separate from the feed because the header badge and the
 * chip counters describe the entire inbox, not the pages currently loaded.
 */
export interface NotificationsSummary {
  total: number;
  unread: number;
  byType: Partial<Record<NotificationType, number>>;
}

export type NotificationChannel = 'email' | 'telegram';

/**
 * One key per thing the game tells a player about — the settings screen renders
 * exactly this list. Every key is gated at a real send site on the backend
 * (`DEFAULT_PREFS` in `notifications.service.ts`); a key with nothing behind it
 * would be a switch that lies.
 */
export type NotificationPreferenceKey =
  | 'tournamentStart'
  | 'tournamentEnd'
  | 'invites'
  | 'stake'
  | 'engines'
  /** Кликер Тикки набит доверху и больше ничего не печатает. */
  | 'tikki'
  | 'gifts'
  | 'friends'
  | 'achievements'
  | 'system';

/**
 * Кто может звать игрока на дуэль.
 *
 * «Все» включает друзей по определению — отдельного «и то и это» не бывает.
 * По умолчанию `friends`: вызов это модалка поверх экрана, и незнакомец,
 * способный её вызвать, превращает игру в место, откуда хочется уйти.
 */
export type DuelInvitePolicy = 'nobody' | 'friends' | 'everyone';

export type NotificationPreferences = Record<
  NotificationChannel,
  Record<NotificationPreferenceKey, boolean>
> & {
  duelInvitesFrom: DuelInvitePolicy;
};
