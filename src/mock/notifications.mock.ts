import type {
  Notification,
  NotificationsFilter,
  NotificationsPage,
  NotificationsSummary,
  NotificationType,
} from '@/types/interfaces/notifications.interfaces';
import { routes } from '@/constants/routes';
import { NOTIFICATIONS_PAGE_SIZE } from '@/constants/notifications.constants';
import { appConfig } from '@/config/app.config';

const now = new Date();

/**
 * A fixture timestamp `days` ago at `hour`.
 *
 * The hour matters: these used to share one `Date` object per bucket, so two
 * notifications from the same day were byte-identical timestamps — which is
 * exactly what hid the feed grouping by full ISO string instead of by calendar
 * day. Real `createdAt` values never collide, so neither should the mocks.
 */
const daysAgo = (days: number, hour: number) => {
  const d = new Date(now);
  d.setDate(now.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const today = new Date(now);
const yesterday = daysAgo(1, 21);
const yesterdayEarly = daysAgo(1, 9);
const yesterdayNight = daysAgo(1, 2);
const older = daysAgo(3, 18);
const older2 = daysAgo(5, 20);
const older2Early = daysAgo(5, 7);
const older3 = daysAgo(10, 22);
const older3Mid = daysAgo(10, 13);
const older3Early = daysAgo(10, 4);
const older4 = daysAgo(15, 12);
const older5 = daysAgo(20, 12);

/**
 * A deeper back-catalogue so the feed is actually several pages long in dev.
 *
 * Not decoration: with a dozen fixtures the pagination never engaged, and the
 * page-boundary bugs it can hide — a repeated row, a cursor that stalls, a
 * count taken from the loaded page instead of the inbox — are exactly the ones
 * a short list cannot show. Shaped like the real traffic: a result row per
 * tournament entered, plus the occasional stake and task.
 */
const HISTORY_TEMPLATES = [
  {
    type: 'tournament' as const,
    title: 'Tournament result',
    content: (n: number) => `You finished #${n} in "Evening Silver". Better luck next time!`,
    actionRoute: routes.tournaments.index,
  },
  {
    type: 'reward' as const,
    title: 'Tournament result',
    content: (n: number) => `You finished #${n} in "Morning Gold" and won ${n * 250} LC.`,
    actionRoute: routes.tournaments.index,
  },
  {
    type: 'task' as const,
    title: 'Daily task completed',
    content: (n: number) => `You completed "Watch ${n} ads" and collected the reward.`,
    actionRoute: routes.tasks,
  },
  {
    type: 'stake' as const,
    title: 'Staking ready to claim',
    content: (n: number) => `Your level ${(n % 5) + 1} stake has matured. Claim your rewards.`,
    actionRoute: routes.stakes.index,
  },
];

const history: Notification[] = Array.from({ length: 36 }, (_, i) => {
  const template = HISTORY_TEMPLATES[i % HISTORY_TEMPLATES.length];
  // Two or three a day, walking back ~three weeks from the hand-written block.
  const day = 22 + Math.floor(i / 2);
  return {
    id: `h${i + 1}`,
    type: template.type,
    title: template.title,
    content: template.content(i + 3),
    read: true,
    date: daysAgo(day, 20 - (i % 2) * 9).toISOString(),
    actionRoute: template.actionRoute,
  };
});

const notifications = (
  [
    {
      id: '1',
      type: 'system',
      title: 'Welcome to LuckyTicket365!',
      content:
        'Welcome to LuckyTicket365! We are glad to have you on board. Let us know if you have any questions or need assistance.',
      read: false,
      // Flip to 'banner' or 'modal' to exercise NotificationAutoSurface in dev.
      // Left at the default so the tabs don't open behind a popup every reload.
      displayMode: 'feed',
      date: today.toISOString(),
    },
    {
      id: '2',
      type: 'tournament',
      title: 'New Tournament Available',
      content: 'The Diamond Solo Cup is now open for registration. Join now!',
      read: false,
      date: yesterday.toISOString(),
      actionRoute: routes.tournaments.index,
    },
    {
      id: '3',
      type: 'leaderboard',
      title: 'Weekly Leaderboard Result',
      content: 'You have reached the 3rd place in the weekly leaderboard.',
      read: true,
      date: yesterdayEarly.toISOString(),
      actionRoute: routes.leaderboard,
    },
    {
      id: '4',
      type: 'system',
      title: 'System Maintenance',
      content: 'The system will be down for maintenance tomorrow from 2 AM to 4 AM UTC.',
      read: false,
      date: yesterdayNight.toISOString(),
    },
    {
      id: '5',
      type: 'friend',
      title: 'Friend reward ready',
      content: 'You have new claimable tickets from a friend. Tap to collect.',
      read: true,
      date: older.toISOString(),
      actionRoute: routes.inviteFriends,
    },
    {
      id: '6',
      type: 'tournament',
      title: 'Tournament Participation',
      content: 'You have successfully registered for the Golden Solo Cup.',
      read: false,
      date: older2.toISOString(),
      actionRoute: routes.tournaments.index,
    },
    {
      id: '7',
      type: 'reward',
      title: 'Tournament Result',
      content: 'You have won the Silver Solo Cup. Congratulations!',
      read: true,
      date: older2Early.toISOString(),
      actionRoute: routes.wallet,
    },
    {
      id: '8',
      type: 'tournament',
      title: 'Tournament Invitation',
      content: 'You have been invited to join the Platinum Solo Cup.',
      read: true,
      date: older3.toISOString(),
      actionRoute: routes.tournaments.index,
    },
    {
      id: '9',
      type: 'task',
      title: 'Weekly Task Completion',
      content: 'You have completed the weekly task "Join 5 Tournaments".',
      read: false,
      date: older3Mid.toISOString(),
      actionRoute: routes.tasks,
    },
    {
      id: '10',
      type: 'task',
      title: 'Monthly Task Completion',
      content: 'You have completed the monthly task "Refer 10 Friends".',
      read: true,
      date: older3Early.toISOString(),
      actionRoute: routes.tasks,
    },
    {
      id: '11',
      type: 'stake',
      title: 'Stake Ready to Claim',
      content: 'Your Level 2 stake is ready. Claim your rewards now.',
      read: false,
      date: older4.toISOString(),
      actionRoute: routes.stakes.index,
    },
    {
      id: '12',
      type: 'tournament',
      title: 'Tournament Participation Reminder',
      content: 'Reminder: You have an upcoming tournament. Do not miss it!',
      read: true,
      date: older5.toISOString(),
      actionRoute: routes.tournaments.index,
    },
    ...history,
  ] satisfies Notification[]
).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Level-zero: an empty inbox (the demo notifications stay in `notifications`).
const inbox: Notification[] = appConfig.account.fresh ? [] : notifications;

type FeedParams = { filter?: NotificationsFilter; cursor?: string; limit?: number };

/**
 * The mock resolver strips the query string, so the request arrives here as the
 * raw `FetchArgs` with `params` still on it — the same object `query()` built.
 */
const feedParams = (args: unknown): FeedParams =>
  ((args as { params?: FeedParams } | undefined)?.params ?? {}) as FeedParams;

/**
 * Ids marked read during this session.
 *
 * Kept beside the fixtures rather than written into them: the objects the feed
 * returns end up in the RTK store, and the store deep-freezes what it holds —
 * so a mock that mutated its own fixtures threw `Cannot assign to read only
 * property 'read'`, failed the mutation, and rolled the optimistic patch back.
 * Reading through a set also means every response is a fresh object, which is
 * what keeps the fixtures unfrozen in the first place.
 */
const readIds = new Set<string>();

const withReadState = (notification: Notification): Notification => ({
  ...notification,
  read: notification.read || readIds.has(notification.id),
});

const matchesFilter = (notification: Notification, filter: NotificationsFilter) => {
  if (filter === 'all') return true;
  if (filter === 'unread') return !notification.read;
  return notification.type === filter;
};

export const notificationsMock = {
  /** Cursor pagination, mirroring the backend down to the has-more probe. */
  'notifications/feed': (args: unknown): NotificationsPage => {
    const { filter = 'all', cursor, limit = NOTIFICATIONS_PAGE_SIZE } = feedParams(args);
    const matching = inbox.map(withReadState).filter(n => matchesFilter(n, filter));
    const start = cursor ? matching.findIndex(n => n.id === cursor) + 1 : 0;
    const page = matching.slice(start, start + limit);
    const hasMore = start + limit < matching.length;
    return { items: page, nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null };
  },

  'notifications/summary': (): NotificationsSummary => ({
    total: inbox.length,
    unread: inbox.map(withReadState).filter(n => !n.read).length,
    byType: inbox.reduce<Partial<Record<NotificationType, number>>>((acc, n) => {
      if (n.type) acc[n.type] = (acc[n.type] ?? 0) + 1;
      return acc;
    }, {}),
  }),

  // Read state is recorded for real rather than answered with `{}`: the app no
  // longer refetches after marking (the optimistic patch is exact), so a mock
  // that forgot would only disagree with the UI on a hard reload — precisely
  // where a stale-cache bug would show itself.
  'POST notifications/mark-all-as-read': () => {
    inbox.forEach(notification => readIds.add(notification.id));
    return {};
  },
  // The mock resolver has no wildcards, so `notifications/:id/mark-as-read`
  // needs one key per notification it can be called on.
  ...Object.fromEntries(
    notifications.map(notification => [
      `POST notifications/${notification.id}/mark-as-read`,
      () => {
        readIds.add(notification.id);
        return {};
      },
    ])
  ),
};
