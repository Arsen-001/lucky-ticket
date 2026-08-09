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
    iconNode: <div className="h-32 w-32">{featured.renderIcon(128)}</div>,
    prices: featured.prices,
    expiresAt: featured.expiresAt,
    isNew: featured.isNew,
    discountPct: featured.discountPct,
    accent: featured.accent,
    mutate: featured.mutate,
  };
}
