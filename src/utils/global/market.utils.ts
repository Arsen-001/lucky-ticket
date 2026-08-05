import { GlobalConstants } from '@/constants/global.constants';
import { MarketPriceType, MarketStatusType } from '@/types/enums/market.enums';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { MarketData, MarketPrice } from '@/types/interfaces/market.interfaces';
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

/** Canonical tier ladder — the enum's declaration order (Bronze → Diamond). */
const tierOrder = Object.values(TicketsEnum) as TicketType[];

/** Unknown/absent tier sorts last instead of jumping to the front. */
const tierRank = (tier: TicketType | undefined): number => {
  const index = tier ? tierOrder.indexOf(tier) : -1;
  return index === -1 ? tierOrder.length : index;
};

const chipRank = (type: InventoryChipType): number => (type === 'speed' ? 0 : 1);

const statusRank = (type: MarketStatusType): number =>
  type === MarketStatusType.LUCKY_PLAYER ? 0 : 1;

/**
 * Deterministic display order for the whole storefront.
 *
 * The catalog endpoint has no ORDER BY, so Postgres hands back rows in physical
 * order — which shifts after **any** UPDATE (a supply decrement, the boot-time
 * price sync, an admin edit). The market therefore reshuffled itself between
 * visits. Every section is sorted by its own ladder — tier Bronze → Diamond
 * first — with `id` as the final tiebreaker so equal keys can never swap
 * places. Applied once in `transformResponse`, so the cards, the hero carousel
 * and the info sheet all read the same order.
 */
export const sortMarketData = (data: MarketData): MarketData => ({
  ...data,
  engines: [...(data.engines ?? [])].sort(
    (a, b) =>
      tierRank(a.ticketType) - tierRank(b.ticketType) ||
      a.engineLevel - b.engineLevel ||
      a.id.localeCompare(b.id)
  ),
  tickets: [...(data.tickets ?? [])].sort(
    (a, b) => tierRank(a.ticketType) - tierRank(b.ticketType) || a.id.localeCompare(b.id)
  ),
  shards: [...(data.shards ?? [])].sort(
    (a, b) =>
      tierRank(a.quality) - tierRank(b.quality) ||
      chipRank(a.type) - chipRank(b.type) ||
      a.id.localeCompare(b.id)
  ),
  // Avatars climb L1 → L10; a cosmetic without a level (badge, theme) sorts last.
  cosmetics: [...(data.cosmetics ?? [])].sort(
    (a, b) =>
      (a.avatarLevel ?? Number.MAX_SAFE_INTEGER) - (b.avatarLevel ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id)
  ),
  statuses: [...(data.statuses ?? [])].sort(
    (a, b) => statusRank(a.statusType) - statusRank(b.statusType) || a.id.localeCompare(b.id)
  ),
});

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
