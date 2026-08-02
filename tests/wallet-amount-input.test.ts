import { describe, it, expect } from 'vitest';
import { sanitizeDecimalInput, walletConstants } from '@/utils/pages/wallet.utils';

/**
 * The TON amount fields were unusable inside Telegram: the keyboard offered no
 * decimal key, and a typed comma was thrown away by the digits-and-dot filter.
 * Since the minimum deposit and withdrawal are both 0.1, that meant no valid
 * amount below 1 could be entered at all.
 */
describe('TON amount input', () => {
  it('accepts a comma as the decimal separator', () => {
    expect(sanitizeDecimalInput('0,5')).toBe('0.5');
    expect(sanitizeDecimalInput('1٫25')).toBe('1.25');
  });

  it('keeps a plain decimal untouched', () => {
    expect(sanitizeDecimalInput('0.5')).toBe('0.5');
    expect(sanitizeDecimalInput('.5')).toBe('.5');
    expect(sanitizeDecimalInput('12')).toBe('12');
  });

  it('drops letters and stray separators instead of the digits', () => {
    expect(sanitizeDecimalInput('0.5 TON')).toBe('0.5');
    expect(sanitizeDecimalInput('0.5.3')).toBe('0.53');
    expect(sanitizeDecimalInput('abc')).toBe('');
  });

  it('parses every quick-pick chip to the number it shows', () => {
    for (const amount of walletConstants.TON_QUICK_AMOUNTS) {
      expect(Number(sanitizeDecimalInput(String(amount)))).toBe(amount);
    }
  });

  it('offers a chip at or above both minimums, so a fraction is one tap away', () => {
    expect(walletConstants.TON_QUICK_AMOUNTS).toContain(walletConstants.TON_MIN_DEPOSIT);
    expect(walletConstants.TON_QUICK_AMOUNTS).toContain(walletConstants.TON_MIN_WITHDRAW);
    // Every chip must survive the per-transaction ceiling, else it renders as
    // an option the server refuses.
    for (const amount of walletConstants.TON_QUICK_AMOUNTS) {
      expect(amount).toBeLessThanOrEqual(walletConstants.TON_MAX_WITHDRAW);
    }
  });
});
