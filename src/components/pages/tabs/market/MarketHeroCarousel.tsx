'use client';

import 'swiper/css';
import 'swiper/css/autoplay';

import { useMemo, type ReactNode } from 'react';
import { Autoplay } from 'swiper/modules';
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
import '@/styles/components/tasks.css';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { marketShardName } from '@/utils/pages/market-name.utils';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketAccent, MarketPrice } from '@/types/interfaces/market.interfaces';
import { formatCompactPrice } from '@/utils/global/number.utils';

export interface MarketHeroCarouselProps {
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

interface FeaturedItem {
  id: string;
  title: string;
  description: string;
  prices: MarketPrice[];
  expiresAt?: string;
  discountPct?: number;
  isNew?: boolean;
  accent: MarketAccent;
  accentColor: string;
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
        prices: orderMarketPrices(applyStatusMarketDiscount(c.prices, discountPct)),
        expiresAt: c.expiresAt,
        discountPct: c.discountPct,
        isNew: c.isNew,
        accent,
        accentColor,
        renderIcon: () => renderAvatarIcon(c.imageUrl ?? '', c.name, accentColor),
        mutate: price => buyCosmetic({ cosmeticId: c.id, price }).unwrap(),
      };
    };

    const shardToItem = (s: (typeof data.shards)[number]): FeaturedItem => ({
      id: s.id,
      title: marketShardName(s, t),
      description: `+${s.count} ${t('shards')}`,
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
  }, [data, buyCosmetic, buyShard, t, discountPct]);

  if (isLoading) {
    return (
      <div className="px-5">
        <div className="bg-background-overlay h-[100px] w-full animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!items.length) return null;

  const buildItem = (featured: FeaturedItem): MarketSelectedItem => ({
    id: featured.id,
    name: featured.title,
    description: featured.description,
    iconNode: <div className="h-32 w-32">{featured.renderIcon(128)}</div>,
    prices: featured.prices,
    expiresAt: featured.expiresAt,
    isNew: featured.isNew,
    discountPct: featured.discountPct,
    accent: featured.accent,
    mutate: featured.mutate,
  });

  return (
    <Swiper
      className="-mt-[10px] w-full"
      modules={[Autoplay]}
      centeredSlides
      grabCursor
      observer
      observeParents
      watchOverflow
      loop={items.length > 2}
      slidesPerView="auto"
      spaceBetween={20}
      autoplay={{
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
    >
      {items.map(featured => {
        const item = buildItem(featured);
        return (
          <SwiperSlide key={featured.id} className="w-72! overflow-visible py-[14px]">
            <MarketHeroCard
              featured={featured}
              onClick={() => onSelect(item)}
              onBuy={price => onBuy(item, price)}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}

interface MarketHeroCardProps {
  featured: FeaturedItem;
  onClick: () => void;
  onBuy: (price: MarketPrice) => void;
}

function MarketHeroCard({ featured, onClick, onBuy }: MarketHeroCardProps) {
  const t = useAppTranslations();
  const price = featured.prices[0];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="task-card-default relative flex h-[82px] w-72 cursor-pointer items-center gap-2.5 rounded-[10px] px-3 transition-transform active:scale-99"
    >
      <div className="relative h-[78px] w-[78px] flex-shrink-0">
        {featured.renderIcon(78)}
        {featured.isNew && (
          <span className="bg-electric-pink absolute -top-1.5 -right-1.5 z-1 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white">
            {t('new')}
          </span>
        )}
        {!featured.isNew && featured.discountPct ? (
          <span className="bg-pink-gradient absolute -top-1.5 -right-1.5 z-1 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold tabular-nums text-white">
            −{featured.discountPct}%
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <h5 className="line-clamp-1 text-[13px] font-bold leading-tight text-white">
          {featured.title}
        </h5>
        {featured.description && (
          <p className="text-pink-secondary line-clamp-1 text-[10px] leading-tight">
            {featured.description}
          </p>
        )}
        {price && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onBuy(price);
            }}
            className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-md px-2 py-1 text-[11px] font-extrabold tabular-nums text-white transition-transform active:scale-95"
            style={{
              backgroundColor: `color-mix(in srgb, ${featured.accentColor} 26%, transparent)`,
              border: `1px solid color-mix(in srgb, ${featured.accentColor} 50%, transparent)`,
            }}
          >
            {price.type === MarketPriceType.TELEGRAM_STARS && <TelegramStarIcon size={11} />}
            {price.originalAmount && (
              <span className="text-[9px] text-white/55 line-through">
                {formatCompactPrice(price.originalAmount)}
              </span>
            )}
            <span>{formatCompactPrice(price.amount)}</span>
            {price.type === MarketPriceType.LC && <LcLabel size={11} interactive={false} />}
          </button>
        )}
      </div>
    </div>
  );
}
