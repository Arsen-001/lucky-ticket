export const getRandomNumber = (min: number = 0, max: number = 9) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const formatNumber = (value: number) => value.toLocaleString('en-US');

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatCompact = (value: number) => compactFormatter.format(value);

/**
 * Ticket-production rate (per hour / per day). Sub-1 rates must keep their
 * fraction — a base bronze engine mints 0.5 T/H and rounding it up to "1"
 * doubles the promised output — while a maxed engine's per-day figure runs into
 * the hundreds, where two decimals are noise.
 */
export const formatTicketRate = (value: number) => {
  const rate = Math.max(0, value);
  if (rate >= 100) return compactFormatter.format(Math.round(rate));
  if (rate >= 1) return String(Math.round(rate * 10) / 10);
  return String(Math.round(rate * 100) / 100);
};

// Compact notation that keeps up to 2 fraction digits, so a price like 1250
// reads as "1.25K" instead of the over-rounded "1.3K". Used for Market prices.
const compactPriceFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

export const formatCompactPrice = (value: number) => compactPriceFormatter.format(value);
