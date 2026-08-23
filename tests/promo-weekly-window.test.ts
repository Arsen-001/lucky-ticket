import { describe, it, expect, vi, afterEach } from 'vitest';
import { utcDay, utcDaysSince } from '@/utils/global/date.utils';

/**
 * Окно молчания промо приглашений: показали — неделю не показываем.
 *
 * Считается по календарным UTC-дням, потому что счёт «прошло ли 168 часов»
 * у игрока, заходящего каждое утро, сдвигал бы показ на всё более позднее
 * время каждую неделю. @see FriendsPromoAutoSurface
 */

const QUIET_DAYS = 7;
const stampDaysAgo = (days: number) =>
  new Date(Date.parse(`${utcDay()}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);

afterEach(() => vi.useRealTimers());

describe('окно молчания промо', () => {
  it('в день показа и всю неделю после — молчит', () => {
    for (const days of [0, 1, 3, 6]) {
      expect(utcDaysSince(stampDaysAgo(days))).toBeLessThan(QUIET_DAYS);
    }
  });

  it('на седьмой день показывает снова', () => {
    expect(utcDaysSince(stampDaysAgo(7))).toBeGreaterThanOrEqual(QUIET_DAYS);
    expect(utcDaysSince(stampDaysAgo(30))).toBeGreaterThanOrEqual(QUIET_DAYS);
  });

  it('нет метки или она испорчена — ограничение не действует', () => {
    // `null` значит «показать»: промолчать из-за мусора в localStorage хуже,
    // чем показать лишний раз.
    expect(utcDaysSince(null)).toBeNull();
    expect(utcDaysSince('')).toBeNull();
    expect(utcDaysSince('позавчера')).toBeNull();
  });

  it('метка из будущего не запирает промо навсегда', () => {
    // Часы игрока могли уйти вперёд — записанный «завтрашний» день иначе
    // молчал бы вечно.
    expect(utcDaysSince(stampDaysAgo(-5))).toBeNull();
  });

  it('день считается по UTC, а не по часовому поясу устройства', () => {
    // 23:30 в Тбилиси (UTC+4) — это ещё 19:30 предыдущих UTC-суток.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-23T19:30:00Z'));
    expect(utcDay()).toBe('2026-08-23');
    expect(utcDaysSince('2026-08-16')).toBe(7);
  });
});
