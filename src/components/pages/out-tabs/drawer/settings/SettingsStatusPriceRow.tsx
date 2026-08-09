'use client';

import { twMerge } from 'tailwind-merge';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';

export interface SettingsStatusPriceRowProps {
  prices: MarketPrice[];
  label?: string;
  /**
   * Which price the purchase will charge. Passing it (with `onSelect`) turns
   * the chips into the CURRENCY PICKER — the status pages used to buy
   * `prices[0]` and nothing else, so a player looking at a Lucky Stars price
   * tag had no way to pay with Stars.
   */
  selectedType?: MarketPriceType;
  onSelect?: (price: MarketPrice) => void;
  className?: string;
}

export function SettingsStatusPriceRow({
  prices,
  label,
  selectedType,
  onSelect,
  className,
}: SettingsStatusPriceRowProps) {
  const t = useAppTranslations();

  if (!prices.length) return null;

  // One price is not a choice — show it as a plain tag rather than a control
  // that looks tappable and does nothing.
  const selectable = Boolean(onSelect) && prices.length > 1;

  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      {label && (
        <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {prices.map(price => {
          const active = selectable && price.type === selectedType;
          const content = (
            <>
              <span className="text-sm font-bold tabular-nums text-white">
                {formatNumber(price.amount)}
              </span>
              {price.type === MarketPriceType.LC && <LcLabel size={14} />}
              {price.type === MarketPriceType.TELEGRAM_STARS && (
                <TelegramStarIcon size={14} alt={t('stars')} />
              )}
            </>
          );
          if (!selectable)
            return (
              <div
                key={price.type}
                className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5"
              >
                {content}
              </div>
            );
          return (
            <button
              key={price.type}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect?.(price)}
              className={twMerge(
                // `relative` is required by the tap-target utility: its 44×44
                // ::after anchors to the nearest positioned ancestor.
                'tap-target relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200 active:scale-[0.97]',
                active
                  ? 'bg-white/20 ring-2 ring-white/70'
                  : 'bg-white/5 opacity-60 ring-1 ring-white/10'
              )}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
