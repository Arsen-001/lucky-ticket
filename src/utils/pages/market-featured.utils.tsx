import { MarketLockPanel } from '@/components/pages/tabs/market/MarketLockPanel';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import type { MarketFeaturedItem } from '@/hooks/useMarketFeaturedItems';

/** The showcase slide, in the shape the info sheet and the purchase flow read. */
export function buildMarketSelectedItem(featured: MarketFeaturedItem): MarketSelectedItem {
  return {
    id: featured.id,
    name: featured.title,
    description: featured.description,
    about: featured.about,
    locked: !!featured.lockedTier,
    lockNote: featured.lockedTier ? <MarketLockPanel tier={featured.lockedTier} /> : undefined,
    // The showcase already draws at any size — hand the renderer straight on
    // instead of freezing it at 128 inside a fixed box.
    renderIcon: featured.renderIcon,
    prices: featured.prices,
    expiresAt: featured.expiresAt,
    isNew: featured.isNew,
    discountPct: featured.discountPct,
    accent: featured.accent,
    // Countable items (shards) buy in bulk from the showcase exactly as they do
    // from the grid — without these three the slide dropped the quantity
    // stepper and sold one unit per confirm, whatever the sheet was asked for.
    maxQuantity: featured.maxQuantity,
    ownedCount: featured.ownedCount,
    ownedIconNode: featured.ownedIconNode,
    mutate: featured.mutate,
  };
}
