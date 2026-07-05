import { GlobalConstants } from '@/constants/global.constants';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { engineMarketPriceLc, lcPriceToLsParity } from '@/utils/global/economy.utils';

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

/**
 * Full price pair (LC + parity LS) for a player's **next** engine of a tier,
 * with the status discount applied — the single source the Market uses to price
 * an engine purchase.
 *
 * Implements the geometric repeat-purchase pricing from DOCS §14.2: the n-th
 * engine of a tier costs `base × engineRepeatPriceGrowth^owned` (the
 * anti-inflation valve). `owned` is how many engines of the tier the player
 * already holds; the LS amount tracks the LC amount at USD parity.
 */
export const engineNextPurchasePrices = (
  tier: TicketType,
  owned: number,
  isLp: boolean,
  isVip: boolean
): MarketPrice[] => {
  const lc = engineMarketPriceLc(tier, owned);
  const base: MarketPrice[] = [
    { type: MarketPriceType.LC, amount: lc },
    { type: MarketPriceType.TELEGRAM_STARS, amount: lcPriceToLsParity(lc) },
  ];
  return applyStatusMarketDiscount(base, isLp, isVip);
};
