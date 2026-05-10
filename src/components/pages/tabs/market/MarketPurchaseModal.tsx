'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
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
}: MarketPurchaseModalProps) {
  const t = useAppTranslations();

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
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
                {price.type === MarketPriceType.LTC && (
                  <span className="text-gold text-sm font-bold">{GlobalConstants.coinName}</span>
                )}
                {price.type === MarketPriceType.TELEGRAM_STARS && (
                  <Image src={icons.telegramStar} alt="" width={18} height={18} />
                )}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
