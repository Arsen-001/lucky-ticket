import { GlobalConstants } from '@/constants/global.constants';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { engineMarketPriceLc, lcPriceToLsParity } from '@/utils/global/economy.utils';

/**
 * Fallback status (VIP > LP) discount percent from the code constants. Used only
 * when the backend didn't send `me.statusPerks` (older API); otherwise the
 * per-level value from `effectiveMarketDiscountPct` wins.
 */
export const statusMarketDiscountPct = (isLp: boolean, isVip: boolean): number => {
  if (isVip) return GlobalConstants.vipMarketDiscountPct;
  if (isLp) return GlobalConstants.luckyPlayerMarketDiscountPct;
  return 0;
};

/**
 * The market discount % the server will actually charge for this user: the
 * backend-resolved per-level perk (`me.statusPerks.marketDiscountPct`) when
 * present, else the code-constant fallback. Keeping this in lockstep with the
 * server is what guarantees the shown price equals the charged price.
 */
export const effectiveMarketDiscountPct = (
  isLp: boolean,
  isVip: boolean,
  perks?: { marketDiscountPct: number }
): number =>
  perks && Number.isFinite(perks.marketDiscountPct)
    ? perks.marketDiscountPct
    : statusMarketDiscountPct(isLp, isVip);

/**
 * Applies a `discountPct` on top of any existing sale. Each price gets its
 * `amount` reduced, with the pre-discount value preserved in `originalAmount`
 * so the UI can render a strike-through. Returns the array unchanged at 0%.
 */
export const applyStatusMarketDiscount = (
  prices: MarketPrice[],
  discountPct: number
): MarketPrice[] => {
  if (discountPct <= 0) return prices;
  return prices.map(p => ({
    ...p,
    originalAmount: p.originalAmount ?? p.amount,
    amount: Math.max(1, Math.round(p.amount * (1 - discountPct / 100))),
  }));
};

const marketPriceRank = (type: MarketPriceType): number =>
  type === MarketPriceType.TELEGRAM_STARS ? 0 : type === MarketPriceType.LC ? 1 : 2;

/**
 * Display order for a Market item's price buttons: **Lucky Stars first** (the
 * real-money anchor), then Lucky Coins, then anything else. Pure display
 * ordering — the catalog may return prices in any order.
 */
export const orderMarketPrices = (prices: MarketPrice[]): MarketPrice[] =>
  [...prices].sort((a, b) => marketPriceRank(a.type) - marketPriceRank(b.type));

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
  discountPct: number
): MarketPrice[] => {
  const lc = engineMarketPriceLc(tier, owned);
  const base: MarketPrice[] = [
    { type: MarketPriceType.LC, amount: lc },
    { type: MarketPriceType.TELEGRAM_STARS, amount: lcPriceToLsParity(lc) },
  ];
  return applyStatusMarketDiscount(base, discountPct);
};
