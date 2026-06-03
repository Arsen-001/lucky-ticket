'use client';

import type { ReactNode } from 'react';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';

export interface MarketPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: ReactNode;
  iconNode?: ReactNode;
  price?: MarketPrice;
  confirmText?: string;
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
}: MarketPurchaseModalProps) {
  const t = useAppTranslations();

  const purchaseAp =
    price?.type === MarketPriceType.TELEGRAM_STARS
      ? Math.floor(price.amount / GlobalConstants.apRewards.purchaseLsPerAp)
      : 0;

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      confirmText={confirmText ?? t('buy')}
      title={title ?? t('confirm purchase')}
      content={
        <div className="mt-2 flex flex-col gap-4 text-center text-white/80">
          <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
            {iconNode && <div className="flex-center shrink-0">{iconNode}</div>}
            <div className="flex flex-col gap-1 text-left">
              <span className="text-sm font-bold text-white leading-tight">{title}</span>
              {description && (
                <span className="text-[12px] leading-snug text-white/60">{description}</span>
              )}
            </div>
          </div>

          {price && (
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <span className="text-pink-secondary text-sm font-bold uppercase tracking-wider">
                {t('price')}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tabular-nums text-white">{price.amount}</span>
                {price.type === MarketPriceType.LC && <LcLabel size={16} />}
                {price.type === MarketPriceType.TELEGRAM_STARS && <TelegramStarIcon size={18} />}
              </div>
            </div>
          )}

          {purchaseAp > 0 && (
            <div className="flex items-center justify-center gap-1.5">
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
