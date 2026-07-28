'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { QuantityStepper } from '@/components/shared/form-elements/QuantityStepper';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetMeQuery } from '@/api/me.api';
import { GlobalConstants } from '@/constants/global.constants';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';

export interface MarketPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen quantity (always 1 for non-countable items). */
  onConfirm: (count: number) => void;
  loading?: boolean;
  title?: string;
  description?: ReactNode;
  iconNode?: ReactNode;
  price?: MarketPrice;
  confirmText?: string;
  /** Cap for the quantity stepper; omit (or pass 1) to hide it. */
  maxQuantity?: number;
  /** How many of this item the player already owns; omit to hide the pill. */
  ownedCount?: number;
  /** Small icon rendered inside the owned pill. */
  ownedIconNode?: ReactNode;
}

export function MarketPurchaseModal({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  description,
  iconNode,
  price,
  confirmText,
  maxQuantity,
  ownedCount,
  ownedIconNode,
}: MarketPurchaseModalProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const [count, setCount] = useState(1);

  const quantityEnabled = (maxQuantity ?? 1) > 1;

  // A fresh purchase always starts at 1 — the modal is reused across items.
  useEffect(() => {
    if (open) setCount(1);
  }, [open]);

  const effectiveCount = quantityEnabled ? count : 1;
  const total = (price?.amount ?? 0) * effectiveCount;

  const balance =
    price?.type === MarketPriceType.LC
      ? (me?.coins ?? 0)
      : price?.type === MarketPriceType.TELEGRAM_STARS
        ? (me?.telegramStars ?? 0)
        : undefined;

  const purchaseAp =
    price?.type === MarketPriceType.TELEGRAM_STARS
      ? Math.floor(total / GlobalConstants.apRewards.purchaseLsPerAp)
      : 0;

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={() => onConfirm(effectiveCount)}
      loading={loading}
      confirmText={confirmText ?? t('buy')}
      title={title ?? t('confirm purchase')}
      content={
        <div className="mt-2 flex flex-col gap-4 text-center text-white/80">
          <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
            {/* Sections hand over a 140–165px node. Left at its own size it eats
                half the row on a 390px screen and wraps the name onto three
                lines, so it is boxed down here too — bigger than the receipt row
                in the success modal, since this is the item being bought. Size is
                forced because those nodes carry inline width/height; every
                variant is square, so filling the box keeps the aspect. */}
            {iconNode && (
              <div className="flex-center size-20 shrink-0 overflow-hidden rounded-2xl [&>*]:size-full! [&_img]:size-full! [&_img]:object-cover">
                {iconNode}
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
              <span className="text-sm font-bold text-white leading-tight">{title}</span>
              {description && (
                <span className="text-[12px] leading-snug text-white/60">{description}</span>
              )}
            </div>
          </div>

          {price && (balance !== undefined || ownedCount !== undefined) && (
            <div className="flex items-center justify-center gap-1.5">
              {balance !== undefined && (
                <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-[11px] leading-none">
                  <span className="font-semibold uppercase tracking-wider text-white/55">
                    {t('available')}
                  </span>
                  {price.type === MarketPriceType.LC && <LcLabel size={14} interactive={false} />}
                  {price.type === MarketPriceType.TELEGRAM_STARS && <TelegramStarIcon size={14} />}
                  {/* Compact (like the header pills) — an exact 12-digit LC balance
                      can't share the row with the owned pill without overflowing. */}
                  <span className="font-extrabold tabular-nums text-white">
                    {formatCompact(balance)}
                  </span>
                </span>
              )}
              {ownedCount !== undefined && (
                <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 px-3 py-2 text-[11px] leading-none">
                  <span className="font-semibold uppercase tracking-wider text-white/55">
                    {t('owned')}
                  </span>
                  {ownedIconNode}
                  <span className="font-extrabold tabular-nums text-white">
                    {formatNumber(ownedCount)}
                  </span>
                </span>
              )}
            </div>
          )}

          {quantityEnabled && (
            <QuantityStepper value={count} onChange={setCount} max={maxQuantity ?? 1} />
          )}

          {price && (
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <span className="text-pink-secondary text-sm font-bold uppercase tracking-wider">
                {effectiveCount > 1 ? t('total') : t('price')}
              </span>
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tabular-nums text-white">
                    {formatNumber(total)}
                  </span>
                  {price.type === MarketPriceType.LC && <LcLabel size={16} interactive={false} />}
                  {price.type === MarketPriceType.TELEGRAM_STARS && <TelegramStarIcon size={18} />}
                </div>
                {/* Reserved even at ×1 so stepping 1↔2 never resizes the modal. */}
                {quantityEnabled && (
                  <span
                    className={twMerge(
                      'text-[11px] tabular-nums text-white/50',
                      effectiveCount <= 1 && 'invisible'
                    )}
                  >
                    {formatNumber(price.amount)} × {effectiveCount}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Always mounted for Stars purchases (invisible at 0 AP) so stepping
              the quantity across the AP threshold never resizes the modal. */}
          {price?.type === MarketPriceType.TELEGRAM_STARS && (
            <div
              className={twMerge(
                'flex items-center justify-center gap-1.5',
                purchaseAp <= 0 && 'invisible'
              )}
            >
              <BoltIcon size={13} />
              <span className="text-teal text-[12px] font-bold">
                {t('plus {n} ap', { n: purchaseAp })}
              </span>
              <span className="text-[12px] text-white/50">{t('for this purchase')}</span>
            </div>
          )}
        </div>
      }
    />
  );
}
