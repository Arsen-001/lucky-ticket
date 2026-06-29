import { describe, it, expect } from 'vitest';
import { formatNumber, formatCompact } from '@/utils/global/number.utils';

describe('number utils', () => {
  it('formatNumber groups thousands', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(0)).toBe('0');
  });

  it('formatCompact shortens millions', () => {
    expect(formatCompact(5_000_000)).toBe('5M');
    expect(formatCompact(1_300_000)).toBe('1.3M');
    expect(formatCompact(2_400_000)).toBe('2.4M');
  });
});
