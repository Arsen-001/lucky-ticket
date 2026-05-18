'use client';

import { Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketAccent, MarketPrice } from '@/types/interfaces/market.interfaces';
import type { MarketSelectedItem } from './MarketView';

const TIER_GLOW: Record<MarketAccent, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
  pink: '#FF4FBE',
  purple: '#743DF5',
};

export interface MarketInfoModalProps {
  open: boolean;
  item: MarketSelectedItem | null;
  onClose: () => void;
  onBuy: (price: MarketPrice) => void;
}

export function MarketInfoModal({ open, item, onClose, onBuy }: MarketInfoModalProps) {
  const t = useAppTranslations();
  const { leftTime, expired } = useCountDown(item?.expiresAt);
  const showCountdown = !!item?.expiresAt && !expired;
  const accent = item?.accent ? TIER_GLOW[item.accent] : 'var(--color-electric-pink)';

  if (!item) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="card-outlined bg-purple-gradient flex flex-col gap-4 rounded-2xl p-5">
        <div
          className="flex-center relative h-44 w-full overflow-hidden rounded-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl"
            style={{ backgroundColor: `color-mix(in srgb, ${accent} 38%, transparent)` }}
          />
          <div className="relative">{item.iconNode}</div>

          {(item.isNew || item.discountPct) && (
            <div className="absolute right-3 top-3 z-3 flex flex-col items-end gap-1">
              {item.isNew && (
                <span className="bg-electric-pink rounded-full px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  {t('new')}
                </span>
              )}
              {item.discountPct ? (
                <span className="bg-pink-gradient rounded-full px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-white">
                  −{item.discountPct}%
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-extrabold leading-tight text-white">{item.name}</h2>
          {item.description && (
            <p className="text-pink-secondary text-[12px] leading-snug">{item.description}</p>
          )}
        </div>

        {item.meta && <div className="flex flex-col gap-1.5">{item.meta}</div>}

        {(showCountdown || (item.remainingSupply !== undefined && item.remainingSupply > 0)) && (
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider">
            {showCountdown && (
              <span
                className="inline-flex items-center gap-1 tabular-nums"
                style={{ color: accent }}
              >
                <Timer size={12} strokeWidth={2.4} />
                {leftTime}
              </span>
            )}
            {item.remainingSupply !== undefined && item.remainingSupply > 0 && (
              <span className="text-pink-secondary tabular-nums">
                {t('left in stock', { count: item.remainingSupply })}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {item.prices.map((price, index) => (
            <PriceButton key={index} price={price} accent={accent} onClick={() => onBuy(price)} />
          ))}
        </div>
      </div>
    </Modal>
  );
}

interface PriceButtonProps {
  price: MarketPrice;
  accent: string;
  onClick: () => void;
}

function PriceButton({ price, accent, onClick }: PriceButtonProps) {
  const isStars = price.type === MarketPriceType.TELEGRAM_STARS;
  const isLtc = price.type === MarketPriceType.LTC;

  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        'flex-center relative gap-1.5 overflow-hidden rounded-xl px-4 py-3 text-base font-extrabold text-white transition-transform active:scale-[0.97] hover:brightness-110'
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accent} 50%, transparent)`,
        boxShadow: `0 0 18px color-mix(in srgb, ${accent} 22%, transparent)`,
      }}
    >
      {isStars && <TelegramStarIcon size={16} />}
      <span className="inline-flex items-baseline gap-1 tabular-nums">
        {price.originalAmount && (
          <span className="text-[12px] text-white/55 line-through">{price.originalAmount}</span>
        )}
        <span>{price.amount}</span>
      </span>
      {isLtc && <span className="text-gold text-[13px] font-bold">{GlobalConstants.coinName}</span>}
    </button>
  );
}
