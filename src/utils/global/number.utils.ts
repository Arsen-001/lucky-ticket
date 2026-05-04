export const getRandomNumber = (min: number = 0, max: number = 9) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const formatNumber = (value: number) => value.toLocaleString('en-US');

/**
 * Compact number formatter — for tight UI slots (slider cards, badges) where
 * "50K" reads better than "50,000". Falls through to raw value under 1000.
 *
 *   formatCompact(250)    → "250"
 *   formatCompact(1500)   → "1.5K"
 *   formatCompact(50_000) → "50K"
 *   formatCompact(2_500_000) → "2.5M"
 */
export const formatCompact = (value: number): string => {
  if (!Number.isFinite(value)) return '0';
  const abs = Math.abs(value);
  if (abs < 1000) return String(value);
  if (abs < 1_000_000) {
    const rounded = abs < 10_000 ? (value / 1000).toFixed(1) : String(Math.round(value / 1000));
    return `${rounded.replace(/\.0$/, '')}K`;
  }
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
};
