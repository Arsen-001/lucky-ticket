'use client';

import { Lock, Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { formatCompactPrice } from '@/utils/global/number.utils';
import { orderMarketPrices } from '@/utils/global/market.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';
import type { MarketSelectedItem } from './MarketView';
import { marketAccentColors, marketDefaultAccent } from '@/constants/tier-colors';

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
  const accent = item?.accent ? marketAccentColors[item.accent] : marketDefaultAccent;

  if (!item) return null;

  return (
    <Modal open={open} onClose={onClose} label={item.name}>
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

          {item.locked && (
            <span className="text-pink-secondary bg-pink-secondary/18 border-pink-secondary/40 absolute left-3 top-3 z-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
              <Lock size={11} strokeWidth={2.6} />
              {t('locked')}
            </span>
          )}

          {(item.isNew || item.discountPct) && (
            // Held left of the modal's close button, which sits in the same
            // corner — the "NEW" pill and the X were painted on top of each
            // other (measured 09.08.2026).
            <div className="absolute right-12 top-3 z-3 flex flex-col items-end gap-1">
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

        {/* Every item says what it is for — the price alone never explained
            whether a shard feeds an engine or a tournament, and a locked card
            explained nothing at all. */}
        {item.about && (
          <div className="flex flex-col gap-1 rounded-xl border border-white/8 bg-white/4 p-3">
            <span className="text-pink-secondary text-[11px] font-extrabold uppercase tracking-wider">
              {t('what it is for')}
            </span>
            <p className="text-white-secondary text-[12px] leading-snug">{item.about}</p>
          </div>
        )}

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

        {item.locked ? (
          item.lockNote
        ) : (
          <div className="flex flex-col gap-2.5">
            {orderMarketPrices(item.prices).map((price, index) => (
              <div key={index} className="flex flex-col gap-1">
                <PriceButton price={price} accent={accent} onClick={() => onBuy(price)} />
                <PriceSaving price={price} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

/**
 * What the discount is worth in coins, under the price it applies to.
 *
 * The percentage alone under-sells the perk on this catalog: a repeat-purchase
 * engine costs millions, so "−2%" reads as rounding while the same cut is
 * 270,000 LC. Stated in the currency of the price it sits under, so an LC
 * saving is never read as stars.
 */
function PriceSaving({ price }: { price: MarketPrice }) {
  const t = useAppTranslations();
  const saved = price.originalAmount ? price.originalAmount - price.amount : 0;
  if (saved <= 0) return null;

  return (
    <span className="text-electric-pink flex-center gap-1 text-[11px] font-bold tabular-nums">
      {t('you save')} {formatCompactPrice(saved)}
      {price.type === MarketPriceType.LC && <LcLabel size={11} interactive={false} />}
      {price.type === MarketPriceType.TELEGRAM_STARS && <TelegramStarIcon size={11} />}
    </span>
  );
}

interface PriceButtonProps {
  price: MarketPrice;
  accent: string;
  onClick: () => void;
}

function PriceButton({ price, accent, onClick }: PriceButtonProps) {
  const isStars = price.type === MarketPriceType.TELEGRAM_STARS;
  const isLc = price.type === MarketPriceType.LC;

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
          <span className="text-[12px] text-white/55 line-through">
            {formatCompactPrice(price.originalAmount)}
          </span>
        )}
        <span>{formatCompactPrice(price.amount)}</span>
      </span>
      {isLc && <LcLabel size={14} interactive={false} />}
    </button>
  );
}
