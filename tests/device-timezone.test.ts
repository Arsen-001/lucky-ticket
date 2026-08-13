import { describe, expect, it } from 'vitest';
import { getDeviceTimezone } from '@/utils/global/timezone.utils';

/**
 * The app's only geographic signal — Telegram gives a bot no location at all,
 * so this is what the admin panel's country column is built on.
 *
 * The property that matters is not "returns Europe/Moscow": it is that a
 * device with nothing to say returns `undefined` rather than a wrong answer.
 * The backend leaves a known country alone when the field is absent, so an
 * empty string or a server-side guess would overwrite real data with noise.
 */
describe('getDeviceTimezone', () => {
  it('reports a zone the backend can map to a country', () => {
    const zone = getDeviceTimezone();

    expect(zone).toBeTypeOf('string');
    // IANA shape — `Area/City`, or `Area/Region/City` for the deep ones.
    expect(zone).toMatch(/^[A-Za-z][A-Za-z0-9_+-]*(\/[A-Za-z0-9_+-]+){0,2}$/);
  });

  it('passes the DTO length cap the backend validates against', () => {
    expect((getDeviceTimezone() ?? '').length).toBeLessThanOrEqual(64);
  });

  it('answers undefined, never an empty string, when the device has no zone', () => {
    const original = Intl.DateTimeFormat;
    // Old WebViews resolve to '' instead of throwing — the case that would
    // otherwise send `timezone: ''` and 400 the whole sign-in over a statistic.
    Intl.DateTimeFormat = (() => ({
      resolvedOptions: () => ({ timeZone: '' }),
    })) as unknown as typeof Intl.DateTimeFormat;

    try {
      expect(getDeviceTimezone()).toBeUndefined();
    } finally {
      Intl.DateTimeFormat = original;
    }
  });

  it('answers undefined instead of throwing when resolution fails', () => {
    const original = Intl.DateTimeFormat;
    Intl.DateTimeFormat = (() => {
      throw new Error('no ICU in this build');
    }) as unknown as typeof Intl.DateTimeFormat;

    try {
      expect(getDeviceTimezone()).toBeUndefined();
    } finally {
      Intl.DateTimeFormat = original;
    }
  });
});
