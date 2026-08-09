'use client';

import 'swiper/css';
import 'swiper/css/autoplay';

import { useState } from 'react';
import type { Swiper as SwiperClass } from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { MarketHeroCard } from '@/components/pages/tabs/market/MarketHeroCard';
import { MarketHeroThumbs } from '@/components/pages/tabs/market/MarketHeroThumbs';
import { useMarketFeaturedItems } from '@/hooks/useMarketFeaturedItems';
import { buildMarketSelectedItem } from '@/utils/pages/market-featured.utils';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';
import '@/styles/components/market.css';

export interface MarketHeroCarouselProps {
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

/**
 * The market showcase: one poster at a time, navigated by a rail of the offers
 * themselves rather than by dots.
 */
export function MarketHeroCarousel({ onSelect, onBuy }: MarketHeroCarouselProps) {
  const { items, isLoading } = useMarketFeaturedItems();
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="px-5">
        <div className="bg-background-overlay h-[176px] w-full animate-pulse rounded-[20px]" />
      </div>
    );
  }

  if (!items.length) return null;

  return (
    // The gutter belongs to this wrapper, not to Swiper: padding on the Swiper
    // itself leaves the neighbouring slide visible inside it, which reads as a
    // stray sliver at the screen edge.
    <div className="flex flex-col gap-2.5 px-5">
      <Swiper
        className="w-full"
        modules={[Autoplay]}
        grabCursor
        observer
        observeParents
        watchOverflow
        loop={items.length > 1}
        slidesPerView={1}
        spaceBetween={12}
        onSwiper={setSwiper}
        onSlideChange={s => setActiveIndex(s.realIndex)}
        // Slower than a list carousel on purpose: each slide is a full offer to
        // read, not a chip to glance at.
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
      >
        {items.map(featured => {
          const item = buildMarketSelectedItem(featured);
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

      <MarketHeroThumbs
        items={items}
        activeIndex={activeIndex}
        // `slideToLoop`, not `slideTo`: with loop on, Swiper's own indexes count
        // the cloned slides, so slideTo would jump to the wrong offer.
        onPick={index => swiper?.slideToLoop(index)}
      />
    </div>
  );
}
