'use client';

import 'swiper/css';
import 'swiper/css/autoplay';

import Image from 'next/image';
import { useMemo } from 'react';
import { Sparkles, Timer } from 'lucide-react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  useBuyChipMutation,
  useBuyCosmeticMutation,
  useBuyPassMutation,
  useGetMarketDataQuery,
} from '@/api/market.api';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketSelectedPurchase } from '@/components/pages/tabs/market/MarketView';
import type { MarketChip, MarketPrice } from '@/types/interfaces/market.interfaces';

export interface MarketHeroCarouselProps {
  onPurchase?: (purchase: MarketSelectedPurchase) => void;
}

interface FeaturedSlide {
  id: string;
  title: string;
  subtitle: string;
  prices: MarketPrice[];
  imageUrl?: string;
  expiresAt?: string;
  discountPct?: number;
  isNew?: boolean;
  accent: string;
  badgeKey: 'hot deal' | 'new' | 'limited' | 'apex';
  mutate: () => Promise<unknown>;
}

export function MarketHeroCarousel({ onPurchase }: MarketHeroCarouselProps) {
  const t = useAppTranslations();
  const { data, isLoading } = useGetMarketDataQuery();
  const [buyCosmetic] = useBuyCosmeticMutation();
  const [buyPass] = useBuyPassMutation();
  const [buyChip] = useBuyChipMutation();

  const slides = useMemo<FeaturedSlide[]>(() => {
    if (!data) return [];
    const list: FeaturedSlide[] = [];

    const apex = data.cosmetics.find(c => c.avatarLevel === 10);
    if (apex) {
      list.push({
        id: apex.id,
        title: apex.name,
        subtitle: apex.description ?? '',
        prices: apex.prices,
        imageUrl: apex.imageUrl,
        expiresAt: apex.expiresAt,
        discountPct: apex.discountPct,
        isNew: apex.isNew,
        accent: 'var(--color-electric-pink)',
        badgeKey: 'apex',
        mutate: () => buyCosmetic({ cosmeticId: apex.id, price: apex.prices[0] }).unwrap(),
      });
    }

    data.cosmetics
      .filter(c => c.featured && c.id !== apex?.id)
      .forEach(c => {
        list.push({
          id: c.id,
          title: c.name,
          subtitle: c.description ?? '',
          prices: c.prices,
          imageUrl: c.imageUrl,
          expiresAt: c.expiresAt,
          discountPct: c.discountPct,
          isNew: c.isNew,
          accent: c.accent ? `var(--color-${c.accent})` : 'var(--color-electric-pink)',
          badgeKey: 'hot deal',
          mutate: () => buyCosmetic({ cosmeticId: c.id, price: c.prices[0] }).unwrap(),
        });
      });

    data.passes
      .filter(p => p.featured)
      .forEach(p => {
        list.push({
          id: p.id,
          title: p.name,
          subtitle: t('pass duration days', { days: p.durationDays }),
          prices: p.prices,
          expiresAt: p.expiresAt,
          discountPct: p.discountPct,
          isNew: p.isNew,
          accent: 'var(--color-electric-purple)',
          badgeKey: 'limited',
          mutate: () => buyPass({ passId: p.id, price: p.prices[0] }).unwrap(),
        });
      });

    data.chips
      .filter(c => c.featured)
      .forEach(c => {
        list.push({
          id: c.id,
          title: c.name,
          subtitle: chipSubtitle(c),
          prices: c.prices,
          discountPct: c.discountPct,
          isNew: c.isNew,
          accent: `var(--color-${c.quality})`,
          badgeKey: 'hot deal',
          mutate: () =>
            buyChip({
              chipId: c.id,
              chipType: c.type,
              quality: c.quality,
              level: c.level,
              effectPct: c.effectPct,
              price: c.prices[0],
            }).unwrap(),
        });
      });

    return list;
  }, [data, buyCosmetic, buyPass, buyChip, t]);

  if (!isLoading && !slides.length) return null;

  const items: (FeaturedSlide | null)[] = isLoading
    ? (new Array(4).fill(null) as (FeaturedSlide | null)[])
    : slides;

  return (
    <div className="flex flex-col gap-3">
      <Swiper
        key={isLoading ? 'loading' : 'loaded'}
        className="w-full"
        modules={[Autoplay]}
        centeredSlides
        grabCursor
        observer
        observeParents
        watchOverflow
        loop={!isLoading && slides.length > 2}
        slidesPerView="auto"
        spaceBetween={20}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
      >
        {items.map((slide, index) => (
          <SwiperSlide key={slide?.id ?? index} className="w-72! overflow-visible py-2">
            {slide ? (
              <FeaturedSlideCard
                slide={slide}
                onClick={() =>
                  onPurchase?.({
                    id: slide.id,
                    name: slide.title,
                    description: slide.subtitle,
                    iconNode: slide.imageUrl ? (
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                        <Image
                          src={slide.imageUrl}
                          alt={slide.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex-center h-14 w-14 rounded-xl"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${slide.accent} 18%, transparent)`,
                        }}
                      >
                        <Sparkles size={28} style={{ color: slide.accent }} strokeWidth={2.2} />
                      </div>
                    ),
                    price: slide.prices[0],
                    mutate: slide.mutate,
                  })
                }
              />
            ) : (
              <div className="bg-background-overlay h-[132px] w-full rounded-2xl" />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function chipSubtitle(c: MarketChip): string {
  return `Lvl ${c.level} · +${c.effectPct}%`;
}

interface FeaturedSlideCardProps {
  slide: FeaturedSlide;
  onClick: () => void;
}

function FeaturedSlideCard({ slide, onClick }: FeaturedSlideCardProps) {
  const t = useAppTranslations();
  const { leftTime, expired } = useCountDown(slide.expiresAt);
  const showCountdown = !!slide.expiresAt && !expired;
  const firstPrice = slide.prices[0];

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
      className="relative flex h-full min-h-[132px] w-full cursor-pointer flex-col overflow-hidden rounded-2xl text-left transition-transform active:scale-99"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${slide.accent} 22%, transparent) 0%, var(--color-background-overlay) 65%)`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: `color-mix(in srgb, ${slide.accent} 35%, transparent)` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[14%] right-[14%] z-2 h-[3px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${slide.accent} 90%, transparent) 50%, transparent 100%)`,
          filter: 'blur(0.8px)',
        }}
      />

      <span
        className="absolute left-3 top-3 z-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white animate-pulse"
        style={{ backgroundColor: `color-mix(in srgb, ${slide.accent} 38%, transparent)` }}
      >
        <Sparkles size={10} strokeWidth={2.6} />
        {t(slide.badgeKey)}
      </span>

      <div className="relative flex flex-1 items-center gap-3 px-4 pt-10 pb-4">
        {slide.imageUrl ? (
          <div
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2"
            style={{
              borderColor: `color-mix(in srgb, ${slide.accent} 65%, transparent)`,
              boxShadow: `0 0 18px color-mix(in srgb, ${slide.accent} 40%, transparent)`,
            }}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className="flex-center h-16 w-16 shrink-0 rounded-2xl border-2"
            style={{
              borderColor: `color-mix(in srgb, ${slide.accent} 55%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${slide.accent} 18%, transparent)`,
              boxShadow: `inset 0 0 22px color-mix(in srgb, ${slide.accent} 40%, transparent)`,
            }}
          >
            <Sparkles size={32} style={{ color: slide.accent }} strokeWidth={2.2} />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="line-clamp-1 text-base font-extrabold leading-tight text-white">
            {slide.title}
          </h3>
          <p className="line-clamp-2 text-[12px] leading-snug text-white/65">{slide.subtitle}</p>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            {showCountdown && (
              <span
                className="inline-flex items-center gap-1 tabular-nums"
                style={{ color: slide.accent }}
              >
                <Timer size={11} strokeWidth={2.5} />
                {leftTime}
              </span>
            )}
            {slide.discountPct ? (
              <span
                className="rounded-md px-1.5 py-0.5 text-background tabular-nums"
                style={{ backgroundColor: slide.accent }}
              >
                −{slide.discountPct}%
              </span>
            ) : null}
          </div>
        </div>

        {firstPrice && (
          <div
            className="flex-center shrink-0 flex-col rounded-xl px-3 py-2 text-white"
            style={{
              backgroundColor: `color-mix(in srgb, ${slide.accent} 30%, transparent)`,
              border: `1px solid color-mix(in srgb, ${slide.accent} 55%, transparent)`,
            }}
          >
            <span className="inline-flex items-center gap-1 text-base font-extrabold tabular-nums leading-none">
              {firstPrice.amount}
              {firstPrice.type === MarketPriceType.LTC && (
                <span className="text-[12px]">{GlobalConstants.coinName}</span>
              )}
              {firstPrice.type === MarketPriceType.TELEGRAM_STARS && (
                <Image src={icons.telegramStar} alt="" width={14} height={14} />
              )}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-white/65">
              {t('grab now')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
