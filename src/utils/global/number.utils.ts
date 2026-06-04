export const getRandomNumber = (min: number = 0, max: number = 9) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const formatNumber = (value: number) => value.toLocaleString('en-US');

const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export const formatCompact = (value: number) => compactFormatter.format(value);

// Compact notation that keeps up to 2 fraction digits, so a price like 1250
// reads as "1.25K" instead of the over-rounded "1.3K". Used for Market prices.
const compactPriceFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
});

export const formatCompactPrice = (value: number) => compactPriceFormatter.format(value);
