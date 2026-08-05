import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import {
  getNotificationsGroupTitle,
  groupNotificationsByDate,
  toInternalRoute,
} from '@/utils/pages/notification.utils';
import {
  NOTIFICATION_PSEUDO_FILTERS,
  NOTIFICATION_TYPES,
} from '@/constants/notifications.constants';
import type { Notification } from '@/types/interfaces/notifications.interfaces';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const at = (iso: string, id = iso): Notification => ({
  id,
  title: 't',
  content: 'c',
  read: false,
  date: iso,
});

const daysAgo = (days: number, hour: number, minute = 0) =>
  dayjs().subtract(days, 'day').hour(hour).minute(minute).second(0).millisecond(0).toISOString();

describe('notification date grouping', () => {
  /**
   * The feed grouped older notifications by `date.toISOString()`, so two rows
   * from the same day landed in different groups and the screen repeated the
   * same date header for every row. The mock fixtures share one `Date` object
   * per bucket, which is exactly why it never showed up in development.
   */
  it('puts every notification of one older day under a single header', () => {
    const groups = groupNotificationsByDate([
      at(daysAgo(3, 20, 15)),
      at(daysAgo(3, 9, 4)),
      at(daysAgo(3, 1, 59)),
    ]);

    expect(Object.keys(groups)).toHaveLength(1);
    expect(Object.values(groups)[0]).toHaveLength(3);
  });

  it('keeps today and yesterday as their own named groups', () => {
    const groups = groupNotificationsByDate([
      at(dayjs().hour(10).toISOString()),
      at(daysAgo(1, 10)),
      at(daysAgo(4, 10)),
      at(daysAgo(4, 11)),
    ]);

    expect(Object.keys(groups).slice(0, 2)).toEqual(['today', 'yesterday']);
    expect(Object.keys(groups)).toHaveLength(3);
  });

  it('preserves the newest-first order the API returns', () => {
    const newest = daysAgo(2, 18);
    const oldest = daysAgo(2, 6);
    const groups = groupNotificationsByDate([at(newest), at(oldest)]);

    expect(Object.values(groups)[0].map(n => n.date)).toEqual([newest, oldest]);
  });

  it('renders a day key as a date and a skeleton key as nothing', () => {
    const t = ((key: string) => key) as never;

    expect(getNotificationsGroupTitle('2026-03-09', t)).toBe('09 march 2026');
    // `dayjs('1')` is a *valid* date (2001-01-01) — the placeholder groups the
    // skeleton renders must not turn into a real-looking header.
    expect(getNotificationsGroupTitle('1', t)).toBe('');
    expect(getNotificationsGroupTitle(undefined, t)).toBe('');
  });
});

describe('notification action routes', () => {
  /**
   * `actionRoute` is free text typed into the admin panel and handed straight
   * to `router.push`. Anything that is not an in-app absolute path is a dead
   * link at best and an off-platform navigation at worst.
   */
  it('accepts in-app paths', () => {
    expect(toInternalRoute('/tournaments')).toBe('/tournaments');
    expect(toInternalRoute('/profile/42')).toBe('/profile/42');
  });

  it('rejects anything that leaves the app', () => {
    expect(toInternalRoute('https://example.com')).toBeUndefined();
    expect(toInternalRoute('//example.com')).toBeUndefined();
    expect(toInternalRoute('javascript:alert(1)')).toBeUndefined();
    expect(toInternalRoute('tournaments')).toBeUndefined();
    expect(toInternalRoute('')).toBeUndefined();
    expect(toInternalRoute(undefined)).toBeUndefined();
  });
});

describe('notification filter parity', () => {
  const backendRoot = resolve(process.cwd(), '../lucky-ticket-backend');
  const hasBackend = existsSync(backendRoot);

  /**
   * Three lists have to agree or the filter chips break in ways nothing else
   * catches: a chip whose value the backend DTO rejects answers 400 (the global
   * pipe runs `forbidNonWhitelisted`), and a Prisma type no chip knows about
   * becomes notifications the player can see in All but never filter to.
   */
  it.runIf(hasBackend)('matches the backend Prisma enum and the feed DTO', () => {
    const schema = readFileSync(resolve(backendRoot, 'prisma/schema.prisma'), 'utf8');
    const prisma = (schema.match(/enum NotificationType \{([^}]*)\}/)?.[1] ?? '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//'))
      .map(value => value.toLowerCase());

    const dto = readFileSync(
      resolve(backendRoot, 'src/notifications/dto/notification.dto.ts'),
      'utf8'
    );
    const dtoFilters = [
      ...(dto.match(/FEED_FILTERS = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([^']+)'/g),
    ].map(m => m[1]);

    expect(prisma).not.toHaveLength(0);
    expect([...NOTIFICATION_TYPES].sort()).toEqual([...prisma].sort());
    expect([...dtoFilters].sort()).toEqual(
      [...NOTIFICATION_PSEUDO_FILTERS, ...NOTIFICATION_TYPES].sort()
    );
  });
});
