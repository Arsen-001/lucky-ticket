import { describe, expect, it } from 'vitest';
import { markAdViewSpent } from '../src/utils/pages/ad-slots.utils';
import type { AdsBlock } from '../src/types/interfaces/tasks.interfaces';

/**
 * Reported from production 21.08.2026. A Lucky Player has twelve views a day
 * (the VIP 2 row) and ten skips (the status perk), so the eleventh tap is
 * ALWAYS a refusal — and the card kept offering «Забрать без просмотра» for
 * as long as the refetch after the tenth was in flight.
 *
 * `markAdViewSpent` closes that window: the cache tells the truth the moment
 * the server confirms, so the button flips to «Смотреть» before the player can
 * reach it.
 */
const block = (over: Partial<AdsBlock> = {}): AdsBlock => ({
  enabled: true,
  total: 12,
  free: 12,
  watchedToday: 9,
  resetAt: '2026-08-22T00:00:00.000Z',
  slots: Array.from({ length: 12 }, (_, index) => ({
    id: `ad-slot-${index}`,
    index,
    rewards: [{ type: 'activity_points', amount: 1 }],
    watched: index < 9,
    skippable: index >= 9 && index < 10,
  })) as AdsBlock['slots'],
  skip: { total: 10, usedToday: 9, remaining: 1 },
  ...over,
});

describe('markAdViewSpent', () => {
  it('spends the last skip and stops the card offering another one', () => {
    const ads = block();
    markAdViewSpent(ads, { adId: 'ad-slot-9', skipped: true });

    expect(ads.watchedToday).toBe(10);
    expect(ads.slots[9].watched).toBe(true);
    expect(ads.skip).toEqual({ total: 10, usedToday: 10, remaining: 0 });
    // The whole point: view 11 is left to the video it now costs.
    expect(ads.slots.some(s => s.skippable)).toBe(false);
  });

  it('leaves the allowance alone for a view that played a real ad', () => {
    const ads = block();
    markAdViewSpent(ads, { adId: 'ad-slot-9' });

    expect(ads.watchedToday).toBe(10);
    expect(ads.skip).toEqual({ total: 10, usedToday: 9, remaining: 1 });
  });

  it('keeps a still-standing allowance visible on the next slot', () => {
    const ads = block({
      watchedToday: 3,
      skip: { total: 10, usedToday: 3, remaining: 7 },
      slots: Array.from({ length: 12 }, (_, index) => ({
        id: `ad-slot-${index}`,
        index,
        rewards: [{ type: 'activity_points', amount: 1 }],
        watched: index < 3,
        skippable: index >= 3 && index < 10,
      })) as AdsBlock['slots'],
    });
    markAdViewSpent(ads, { adId: 'ad-slot-3', skipped: true });

    expect(ads.skip?.remaining).toBe(6);
    expect(ads.slots[4].skippable).toBe(true);
  });

  it('ignores an answer for a view already spent — one view, one slot', () => {
    const ads = block();
    markAdViewSpent(ads, { adId: 'ad-slot-0', skipped: true });

    expect(ads.watchedToday).toBe(9);
    expect(ads.skip?.remaining).toBe(1);
  });

  it('never counts past the day, and survives a payload with no skip block', () => {
    const spent = block({ watchedToday: 12 });
    markAdViewSpent(spent, { adId: 'ad-slot-11', skipped: true });
    expect(spent.watchedToday).toBe(12);

    const noSkip = block({ skip: undefined });
    markAdViewSpent(noSkip, { adId: 'ad-slot-9', skipped: true });
    expect(noSkip.watchedToday).toBe(10);
    expect(noSkip.skip).toBeUndefined();
  });
});
