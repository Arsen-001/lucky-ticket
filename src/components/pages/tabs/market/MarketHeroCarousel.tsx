'use client';

import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/pagination';

import { useMemo, type ReactNode } from 'react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  useBuyCosmeticMutation,
  useBuyShardMutation,
  useGetMarketDataQuery,
} from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import {
  applyStatusMarketDiscount,
  effectiveMarketDiscountPct,
  orderMarketPrices,
} from '@/utils/global/market.utils';
import '@/styles/components/market.css';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { MarketHeroCard } from '@/components/pages/tabs/market/MarketHeroCard';
import { MarketLockPanel } from '@/components/pages/tabs/market/MarketLockPanel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { marketShardName } from '@/utils/pages/market-name.utils';
import type { AvatarBoost, AvatarDailyReward } from '@/types/interfaces/avatars.interfaces';
import type { MarketAccent, MarketPrice } from '@/types/interfaces/market.interfaces';
import { isTierAtOrAbove, type TierName } from '@/types/types/tier.types';
import type { TicketType } from '@/types/types/ticket.types';

export interface MarketHeroCarouselProps {
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

interface FeaturedItem {
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
  mutate: (price: MarketPrice) => Promise<unknown>;
}

const renderAvatarIcon = (imageUrl: string, title: string, accentColor: string): ReactNode => (
  <div
    className="relative h-full w-full overflow-hidden rounded-xl border-2"
    style={{
      borderColor: `color-mix(in srgb, ${accentColor} 65%, transparent)`,
      boxShadow: `0 0 16px color-mix(in srgb, ${accentColor} 38%, transparent)`,
    }}
  >
    {imageUrl ? (
      // Admin-provided URL (Blob upload or pasted) — plain <img> avoids the
      // next/image host allow-list, matching the cards / MarketItemImage.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
    ) : (
      // No image (e.g. a badge/theme cosmetic) — show the name initial on the accent
      // tile instead of passing an empty string to next/image.
      <div
        className="flex-center h-full w-full text-xl font-extrabold"
        style={{ color: accentColor }}
      >
        {title.charAt(0).toUpperCase()}
      </div>
    )}
  </div>
);

export function MarketHeroCarousel({ onSelect, onBuy }: MarketHeroCarouselProps) {
  const t = useAppTranslations();
  const { data, isLoading } = useGetMarketDataQuery();
  const { data: me } = useGetMeQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const discountPct = effectiveMarketDiscountPct(isLp, isVip, me?.statusPerks);
  const [buyCosmetic] = useBuyCosmeticMutation();
  const [buyShard] = useBuyShardMutation();
  // The plain tier string, not `isTierUnlocked`: this list is memoized, and a
  // function identity that changes every render drops the memo entirely.
  const { maxUnlockedTier } = useUnlockedTiers();

  const items = useMemo<FeaturedItem[]>(() => {
    if (!data) return [];
    const list: FeaturedItem[] = [];
    const seen = new Set<string>();

    const cosmeticToItem = (c: (typeof data.cosmetics)[number]): FeaturedItem => {
      const accent: MarketAccent = (c.accent as MarketAccent) ?? 'pink';
      const accentColor = c.accent ? `var(--color-${c.accent})` : 'var(--color-electric-pink)';
      return {
        id: c.id,
        title: c.name,
        description: c.description ?? '',
        about: t('market avatar purpose'),
        prices: orderMarketPrices(applyStatusMarketDiscount(c.prices, discountPct)),
        expiresAt: c.expiresAt,
        discountPct: c.discountPct,
        isNew: c.isNew,
        accent,
        accentColor,
        imageUrl: c.imageUrl ?? undefined,
        boost: c.avatarBoost,
        dailyReward: c.avatarDailyReward,
        renderIcon: () => renderAvatarIcon(c.imageUrl ?? '', c.name, accentColor),
        mutate: price => buyCosmetic({ cosmeticId: c.id, price }).unwrap(),
      };
    };

    const shardToItem = (s: (typeof data.shards)[number]): FeaturedItem => ({
      id: s.id,
      title: marketShardName(s, t),
      description: `+${s.count} ${t('shards')}`,
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
      mutate: price =>
        buyShard({
          shardId: s.id,
          shardType: s.type,
          quality: s.quality,
          count: s.count,
          price,
        }).unwrap(),
    });

    const push = (entry: FeaturedItem) => {
      if (seen.has(entry.id)) return;
      seen.add(entry.id);
      list.push(entry);
    };

    data.cosmetics
      .filter(c => c.featured || c.avatarLevel === 10)
      .forEach(c => push(cosmeticToItem(c)));
    data.shards.filter(s => s.featured).forEach(s => push(shardToItem(s)));

    // Backfill — guarantee at least 4 slides by adding top non-featured items
    const MIN_ITEMS = 4;
    if (list.length < MIN_ITEMS) {
      const fillCosmetics = [...data.cosmetics]
        .filter(c => !seen.has(c.id))
        .sort((a, b) => (b.avatarLevel ?? 0) - (a.avatarLevel ?? 0));
      const fillShards = [...data.shards]
        .filter(s => !seen.has(s.id))
        .sort((a, b) => (b.prices[0]?.amount ?? 0) - (a.prices[0]?.amount ?? 0));
      const queue: FeaturedItem[] = [];
      fillCosmetics.forEach(c => queue.push(cosmeticToItem(c)));
      fillShards.forEach(s => queue.push(shardToItem(s)));
      for (const entry of queue) {
        if (list.length >= MIN_ITEMS) break;
        push(entry);
      }
    }

    return list;
  }, [data, buyCosmetic, buyShard, t, discountPct, maxUnlockedTier]);

  if (isLoading) {
    return (
      <div className="px-5">
        <div className="bg-background-overlay h-[142px] w-full animate-pulse rounded-[18px]" />
      </div>
    );
  }

  if (!items.length) return null;

  const buildItem = (featured: FeaturedItem): MarketSelectedItem => ({
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
  });

  return (
    // The gutter belongs to this wrapper, not to Swiper: padding on the Swiper
    // itself leaves the neighbouring slide visible inside it, which reads as a
    // stray sliver at the screen edge.
    <div className="px-5">
      <Swiper
        // Bottom padding is the dots' room — Swiper pins them to the
        // container, so without it they sit on top of the artwork.
        className="market-hero-swiper w-full pb-7!"
        modules={[Autoplay, Pagination]}
        grabCursor
        observer
        observeParents
        watchOverflow
        loop={items.length > 1}
        slidesPerView={1}
        spaceBetween={12}
        pagination={{ clickable: true }}
        // Slower than a list carousel on purpose: each slide is now a full
        // offer to read, not a chip to glance at.
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
      >
        {items.map(featured => {
          const item = buildItem(featured);
          return (
            <SwiperSlide key={featured.id}>
              <MarketHeroCard
                title={featured.title}
                description={featured.description}
                accentColor={featured.accentColor}
                price={featured.prices[0]}
                isNew={featured.isNew}
                discountPct={featured.discountPct}
                imageUrl={featured.imageUrl}
                locked={!!featured.lockedTier}
                boost={featured.boost}
                dailyReward={featured.dailyReward}
                renderIcon={featured.renderIcon}
                onOpen={() => onSelect(item)}
                onBuy={price => onBuy(item, price)}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
