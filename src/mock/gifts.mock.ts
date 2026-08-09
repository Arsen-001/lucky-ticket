import type { FetchArgs } from '@reduxjs/toolkit/query';
import type { GiftShopState } from '@/types/interfaces/gift.interfaces';

/**
 * The gift counter in dev.
 *
 * Kept stateful rather than static because every interesting thing about this
 * screen is a *transition*: buying files a request, and the grid has to flip
 * into "being confirmed" — a static fixture would show the shop permanently
 * open and validate nothing. Prices mirror the backend defaults (50,000 LC per
 * Star) so what dev shows is what production would charge.
 */
const LC_PER_STAR = 50_000;
const PER_USER_MONTHLY = 1;
const MONTHLY_STAR_BUDGET = 200;

/** Telegram's real cheap tier, in the order the storefront lists it. */
const CATALOG = [
  { id: 'gift-heart', emoji: '❤️', starCount: 15 },
  { id: 'gift-bear', emoji: '🧸', starCount: 15 },
  { id: 'gift-gift', emoji: '🎁', starCount: 25 },
  { id: 'gift-rose', emoji: '🌹', starCount: 25 },
  { id: 'gift-cake', emoji: '🎂', starCount: 50 },
  { id: 'gift-bouquet', emoji: '💐', starCount: 50 },
  { id: 'gift-rocket', emoji: '🚀', starCount: 50 },
  { id: 'gift-ring', emoji: '💍', starCount: 100 },
];

/** `awaiting` mirrors the real flow: buying files a request, it does not send. */
const state = { purchased: 0, spent: 0, awaiting: 0 };

const view = (): GiftShopState => {
  const budgetRemaining = Math.max(0, MONTHLY_STAR_BUDGET - state.spent);
  const atUserLimit = state.purchased >= PER_USER_MONTHLY;
  const gifts = atUserLimit
    ? []
    : CATALOG.filter(g => g.starCount <= budgetRemaining).map(g => ({
        ...g,
        priceLc: g.starCount * LC_PER_STAR,
      }));
  return {
    enabled: true,
    closedReason: state.awaiting
      ? 'pending-review'
      : atUserLimit
        ? 'user-limit'
        : gifts.length
          ? null
          : 'budget-spent',
    lcPerStar: LC_PER_STAR,
    perUserMonthly: PER_USER_MONTHLY,
    purchasedThisMonth: state.purchased,
    budgetRemaining,
    gifts,
  };
};

export const giftsMock = {
  'GET market/gifts': view,
  'POST market/gifts/buy': (args: FetchArgs) => {
    const { giftId } = (args.body ?? {}) as { giftId?: string };
    const gift = CATALOG.find(g => g.id === giftId);
    if (!gift) return { error: { status: 404, data: { message: 'gift-not-available' } } };
    state.purchased += 1;
    state.spent += gift.starCount;
    state.awaiting += 1;
    return {
      ok: true as const,
      emoji: gift.emoji,
      starCount: gift.starCount,
      priceLc: gift.starCount * LC_PER_STAR,
      status: 'pending' as const,
    };
  },
};
