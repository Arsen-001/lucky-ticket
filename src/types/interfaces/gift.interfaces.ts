/**
 * The Market's gift counter — Telegram gifts bought with Lucky Coins.
 *
 * Mirrors `GiftShopView` on the backend. The shop can be shut for four
 * different reasons and the screen states which one: "sold out" and "you
 * already took yours this month" are not the same message to a player, and
 * collapsing them into an empty grid is how a working feature reads as broken.
 */
export type GiftShopClosedReason =
  | 'disabled'
  | 'budget-spent'
  | 'user-limit'
  | 'no-telegram'
  /** Already asked for one; it is waiting to be confirmed. */
  | 'pending-review';

export interface ShopGift {
  id: string;
  emoji: string;
  /** What Telegram charges the bot — shown so the price has a visible basis. */
  starCount: number;
  priceLc: number;
}

export interface GiftShopState {
  enabled: boolean;
  /** Null while the counter is open and has something to sell. */
  closedReason: GiftShopClosedReason | null;
  lcPerStar: number;
  perUserMonthly: number;
  purchasedThisMonth: number;
  /** Stars left in the platform's monthly budget — also caps what is listed. */
  budgetRemaining: number;
  gifts: ShopGift[];
}

export interface BuyGiftResponse {
  ok: true;
  emoji: string;
  starCount: number;
  priceLc: number;
  /**
   * Always `pending`. Buying files a request and takes the coins; the gift is
   * sent after a person confirms it, so nothing here means "delivered".
   */
  status: 'pending';
}
