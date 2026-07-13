import { describe, it, expect } from 'vitest';
import { getJackpotWholePotSplit, getTimeAgo } from '@/utils/global/jackpot.utils';

describe('getJackpotWholePotSplit', () => {
  it('is top-3 only by default — 0 / 50 / 30 / 20 and sums to 100', () => {
    const split = getJackpotWholePotSplit();
    expect(split).toEqual({ participants: 0, first: 50, second: 30, third: 20 });
    expect(split.participants + split.first + split.second + split.third).toBe(100);
  });
});

describe('getTimeAgo', () => {
  const at = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

  it('returns "just now" under a minute', () => {
    expect(getTimeAgo(at(30_000))).toEqual({ key: 'just now', n: 0 });
  });
  it('returns minutes', () => {
    expect(getTimeAgo(at(5 * 60_000))).toEqual({ key: '{n}m ago', n: 5 });
  });
  it('returns hours', () => {
    expect(getTimeAgo(at(3 * 3_600_000))).toEqual({ key: '{n}h ago', n: 3 });
  });
  it('returns days', () => {
    expect(getTimeAgo(at(2 * 86_400_000))).toEqual({ key: '{n}d ago', n: 2 });
  });
});
