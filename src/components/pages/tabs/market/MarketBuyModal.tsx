'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketPrice } from '@/types/interfaces/market.interfaces';
import { MarketPriceType } from '@/types/enums/market.enums';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';

interface MarketBuyModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: ReactNode;
  price: MarketPrice;
  priceLabel?: string;
  icon: ReactNode;
  description: ReactNode;
  children?: ReactNode;
}

export function MarketBuyModal({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  price,
  priceLabel,
  icon,
  description,
  children,
}: MarketBuyModalProps) {
  const t = useAppTranslations();

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      loading={loading}
      title={title}
      content={
        <div className="text-white/80 text-center flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="p-2 bg-white/5 rounded-lg shrink-0">{icon}</div>
            <div className="flex flex-col gap-1 text-left">
              <span className="text-sm text-white/60 leading-[1.2]">{description}</span>
            </div>
          </div>

          {children}

          <div className="flex justify-between items-center bg-white/5 p-3 px-4 rounded-xl">
            <span className="text-sm text-white/60 uppercase font-bold tracking-wider">
              {priceLabel || t('price')}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-white">{price.amount}</span>
              {price.type === MarketPriceType.LTC && (
                <span className="text-sm text-gold font-bold">{GlobalConstants.coinName}</span>
              )}
              {price.type === MarketPriceType.USDT && (
                <span className="text-sm font-black text-emerald-400">USDT</span>
              )}
              {price.type === MarketPriceType.TELEGRAM_STARS && (
                <Image
                  src={icons.telegramStar}
                  alt="stars"
                  className="w-4.5 pb-1 h-auto object-contain"
                />
              )}
            </div>
          </div>
        </div>
      }
    />
  );
}
