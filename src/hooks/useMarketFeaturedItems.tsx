'use client';

import { useMemo, type ReactNode } from 'react';
import {
  // AVATARS OFF (2026-08-09) — no avatar slide is built, so nothing buys one.
  // useBuyCosmeticMutation,
  useBuyShardMutation,
  useGetMarketDataQuery,
} from '@/api/market.api';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import {
  applyStatusMarketDiscount,
  effectiveMarketDiscountPct,
  orderMarketPrices,
} from '@/utils/global/market.utils';
import { marketShardName, marketShardsReceived } from '@/utils/pages/market-name.utils';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import type { AvatarBoost, AvatarDailyReward } from '@/types/interfaces/avatars.interfaces';
import type { MarketAccent, MarketPrice } from '@/types/interfaces/market.interfaces';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import { isTierAtOrAbove, type TierName } from '@/types/types/tier.types';
import type { TicketType } from '@/types/types/ticket.types';

/**
 * One slide of the market showcase — an offer picked out of the catalogue,
 * already priced for this player's status discount.
 */
export interface MarketFeaturedItem {
  id: string;
  title: string;
  description: string;
  /** What the item is for — the sheet states it for every slide. */
  about: string;
  /** Tier gate the slide sits behind; the buy button turns into a lock. */
  lockedTier?: TicketType;
  prices: MarketPrice[];
  expiresAt?: string;
  discountPct?: number;
  isNew?: boolean;
  accent: MarketAccent;
  accentColor: string;
  /** Artwork for the full-bleed showcase slide; shards have none. */
  imageUrl?: string;
  /** Avatars only — what the item does while equipped. */
  boost?: AvatarBoost;
  dailyReward?: AvatarDailyReward;
  renderIcon: (size: number) => ReactNode;
  /** Per-order cap for the quantity stepper; omit for single-purchase items. */
  maxQuantity?: number;
  /** What a whole order of N hands over («+81 shards»); see MarketSelectedItem. */
  describeOrder?: (count: number) => ReactNode;
  /** How many of this item the player already owns — the confirm sheet's pill. */
  ownedCount?: number;
  /** Small icon for that pill; the slide's own artwork does not fit there. */
  ownedIconNode?: ReactNode;
  mutate: (price: MarketPrice, count: number) => Promise<unknown>;
}

// AVATARS OFF (2026-08-09) — the avatar cosmetics feature is switched off for
// ~2 months, not removed. The showcase runs shards only until it is back; the
// avatar slide's artwork is kept here verbatim.
// const renderAvatarIcon = (imageUrl: string, title: string, accentColor: string): ReactNode => (
//   <div
//     className="relative h-full w-full overflow-hidden rounded-xl border-2"
//     style={{
//       borderColor: `color-mix(in srgb, ${accentColor} 65%, transparent)`,
//       boxShadow: `0 0 16px color-mix(in srgb, ${accentColor} 38%, transparent)`,
//     }}
//   >
//     {imageUrl ? (
//       // Admin-provided URL (Blob upload or pasted) — plain <img> avoids the
//       // next/image host allow-list, matching the cards / MarketItemImage.
//       // eslint-disable-next-line @next/next/no-img-element
//       <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
//     ) : (
//       // No image (e.g. a badge/theme cosmetic) — show the name initial on the accent
//       // tile instead of passing an empty string to next/image.
//       <div
//         className="flex-center h-full w-full text-xl font-extrabold"
//         style={{ color: accentColor }}
//       >
//         {title.charAt(0).toUpperCase()}
//       </div>
//     )}
//   </div>
// );

/**
 * The offers the market showcase runs: featured cosmetics and shards, topped up
 * from the catalogue so the rail is never shorter than four slides.
 */
export function useMarketFeaturedItems(): { items: MarketFeaturedItem[]; isLoading: boolean } {
  const t = useAppTranslations();
  const { data, isLoading } = useGetMarketDataQuery();
  const { data: me } = useGetMeQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const discountPct = effectiveMarketDiscountPct(isLp, isVip, me?.statusPerks);
  // AVATARS OFF — const [buyCosmetic] = useBuyCosmeticMutation();
  const [buyShard] = useBuyShardMutation();
  // Already in flight for the shard grid on the same screen — RTK serves both
  // from one request, so the confirm sheet gets its "owned" pill for free.
  const { data: inventory } = useGetInventoryQuery();
  // The plain tier string, not `isTierUnlocked`: this list is memoized, and a
  // function identity that changes every render drops the memo entirely.
  const { maxUnlockedTier } = useUnlockedTiers();

  const items = useMemo<MarketFeaturedItem[]>(() => {
    if (!data) return [];
    const list: MarketFeaturedItem[] = [];
    const seen = new Set<string>();

    // AVATARS OFF (2026-08-09) — kept verbatim; uncomment together with the two
    // feed sites below and the `buyCosmetic` / `renderAvatarIcon` declarations.
    // const cosmeticToItem = (c: (typeof data.cosmetics)[number]): MarketFeaturedItem => {
    //   const accent: MarketAccent = (c.accent as MarketAccent) ?? 'pink';
    //   const accentColor = c.accent ? `var(--color-${c.accent})` : 'var(--color-electric-pink)';
    //   return {
    //     id: c.id,
    //     title: c.name,
    //     description: c.description ?? '',
    //     about: t('market avatar purpose'),
    //     prices: orderMarketPrices(applyStatusMarketDiscount(c.prices, discountPct)),
    //     expiresAt: c.expiresAt,
    //     discountPct: c.discountPct,
    //     isNew: c.isNew,
    //     accent,
    //     accentColor,
    //     imageUrl: c.imageUrl ?? undefined,
    //     boost: c.avatarBoost,
    //     dailyReward: c.avatarDailyReward,
    //     renderIcon: () => renderAvatarIcon(c.imageUrl ?? '', c.name, accentColor),
    //     mutate: price => buyCosmetic({ cosmeticId: c.id, price }).unwrap(),
    //   };
    // };

    const shardToItem = (s: (typeof data.shards)[number]): MarketFeaturedItem => ({
      id: s.id,
      title: marketShardName(s, t),
      description: marketShardsReceived(s.count, t),
      describeOrder: quantity => marketShardsReceived(s.count * quantity, t),
      about: t('market shard purpose'),
      // The grid gates shards by tier; the showcase used to sell the same item
      // with a live Buy button the backend would refuse.
      lockedTier: isTierAtOrAbove(maxUnlockedTier as TierName, s.quality as TierName)
        ? undefined
        : s.quality,
      prices: orderMarketPrices(applyStatusMarketDiscount(s.prices, discountPct)),
      discountPct: s.discountPct,
      isNew: s.isNew,
      accent: s.quality,
      accentColor: `var(--color-${s.quality})`,
      renderIcon: size => (
        <div className="flex-center h-full w-full">
          <ChipShardIcon type={s.type} tier={s.quality} size={Math.round(size / 1.3)} />
        </div>
      ),
      maxQuantity: GlobalConstants.marketMaxUnitsPerOrder,
      ownedCount:
        inventory?.shards.find(own => own.type === s.type && own.quality === s.quality)?.count ?? 0,
      ownedIconNode: <ChipShardIcon type={s.type} tier={s.quality} size={14} />,
      // Same as the grid: one request for the whole order (`count` is the
      // bundle size, `quantity` how many bundles), charged all-or-nothing.
      mutate: (price, quantity) =>
        buyShard({
          shardId: s.id,
          shardType: s.type,
          quality: s.quality,
          count: s.count,
          quantity,
          price,
        }).unwrap(),
    });

    const push = (entry: MarketFeaturedItem) => {
      if (seen.has(entry.id)) return;
      seen.add(entry.id);
      list.push(entry);
    };

    // Bronze opens the showcase, ahead of the admin's own picks. Every other
    // feed here reaches for the top of the ladder — `featured` is set in the
    // panel (Diamond, in practice) and the backfill below sorts by price
    // descending — so the rail used to open on four posters in a row that a
    // fresh account is gated out of buying. Bronze is the one tier nobody is
    // gated out of, so it goes first and the first slide is always purchasable.
    data.shards.filter(s => s.quality === TicketsEnum.BRONZE).forEach(s => push(shardToItem(s)));

    // AVATARS OFF — data.cosmetics
    //   .filter(c => c.featured || c.avatarLevel === 10)
    //   .forEach(c => push(cosmeticToItem(c)));
    data.shards.filter(s => s.featured).forEach(s => push(shardToItem(s)));

    // Backfill — guarantee at least 4 slides by adding top non-featured items
    const MIN_ITEMS = 4;
    if (list.length < MIN_ITEMS) {
      // AVATARS OFF — the backfill runs on shards alone; there are far more than
      // MIN_ITEMS of them, so the rail still fills.
      // const fillCosmetics = [...data.cosmetics]
      //   .filter(c => !seen.has(c.id))
      //   .sort((a, b) => (b.avatarLevel ?? 0) - (a.avatarLevel ?? 0));
      const fillShards = [...data.shards]
        .filter(s => !seen.has(s.id))
        .sort((a, b) => (b.prices[0]?.amount ?? 0) - (a.prices[0]?.amount ?? 0));
      const queue: MarketFeaturedItem[] = [];
      // AVATARS OFF — fillCosmetics.forEach(c => queue.push(cosmeticToItem(c)));
      fillShards.forEach(s => queue.push(shardToItem(s)));
      for (const entry of queue) {
        if (list.length >= MIN_ITEMS) break;
        push(entry);
      }
    }

    return list;
    // AVATARS OFF — `buyCosmetic` drops out of the deps with the avatar slide.
  }, [data, inventory, buyShard, t, discountPct, maxUnlockedTier]);

  return { items, isLoading };
}
