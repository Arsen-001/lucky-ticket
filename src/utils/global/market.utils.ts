import { GlobalConstants } from '@/constants/global.constants';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';

/**
 * Effective status (VIP > LP) discount percent applied to Market prices.
 * VIP supersedes LP — the higher-tier value wins, no stacking.
 */
export const statusMarketDiscountPct = (isLp: boolean, isVip: boolean): number => {
  if (isVip) return GlobalConstants.vipMarketDiscountPct;
  if (isLp) return GlobalConstants.luckyPlayerMarketDiscountPct;
  return 0;
};

/**
 * Applies the status discount on top of any existing sale. Each price gets its
 * `amount` reduced by `statusMarketDiscountPct(...)`, with the pre-discount
 * value preserved in `originalAmount` so the UI can render a strike-through.
 *
 * Returns the original array unchanged when no status is active.
 */
export const applyStatusMarketDiscount = (
  prices: MarketPrice[],
  isLp: boolean,
  isVip: boolean
): MarketPrice[] => {
  const pct = statusMarketDiscountPct(isLp, isVip);
  if (pct <= 0) return prices;
  return prices.map(p => ({
    ...p,
    originalAmount: p.originalAmount ?? p.amount,
    amount: Math.max(1, Math.round(p.amount * (1 - pct / 100))),
  }));
};
