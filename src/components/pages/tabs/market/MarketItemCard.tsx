'use client';

import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { MarketPrice } from '@/types/interfaces/market.interfaces';
import { MarketPriceType } from '@/types/enums/market.enums';
import { GlobalConstants } from '@/constants/global.constants';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import {
  QuantitySelector,
  type QuantitySelectorProps,
} from '@/components/pages/tabs/market/QuantitySelector';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import Image from 'next/image';
import { icons } from '@/constants/icons';

interface MarketItemCardProps {
  name: ReactNode;
  description?: ReactNode;
  prices: MarketPrice[];
  icon?: ReactNode;
  onBuy?: (price: MarketPrice) => void;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  qualitySelectorProps?: QuantitySelectorProps;
  isNew?: boolean;
  classNames?: {
    icon?: string;
    title?: string;
    description?: string;
    children?: string;
    button?: string;
  };
}

export function MarketItemCard({
  name,
  description,
  prices,
  icon,
  onBuy,
  onClick,
  loading,
  disabled,
  children,
  className,
  classNames,
  qualitySelectorProps,
  isNew,
}: MarketItemCardProps) {
  const t = useAppTranslations();

  return (
    <div
      onClick={onClick}
      className={twMerge(
        'bg-purple-gradient rounded-xl p-4 flex flex-col transition-all h-full relative overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {isNew && (
        <div className="absolute top-0 right-0 bg-orange-400/30 px-2 py-1.5 rounded-bl-xl border-l border-b border-white/10 z-10 shadow-lg">
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block leading-none ">
            {t('new')}
          </span>
        </div>
      )}
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="card" className="h-18 w-full rounded-xl flex-center" />}
      >
        <div
          className={twMerge(
            'bg-white/5 rounded-xl h-20 shrink-0 flex-center shadow-inner',
            classNames?.icon
          )}
        >
          {icon}
        </div>
      </SkeletonSuspense>
      <SkeletonSuspense loading={loading} skeleton={<Skeleton textSize="base" className="mt-2" />}>
        <div
          className={twMerge(
            'mt-2 font-semibold text-white leading-tight overflow-hidden text-ellipsis whitespace-nowrap',
            classNames?.title
          )}
        >
          {name}
        </div>
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading}
        skeleton={
          <Skeleton
            variant="text"
            classNames={{ textLine: 'h-3.5 rounded-sm' }}
            lines={2}
            className="mt-1 gap-0.5"
          />
        }
      >
        {description && (
          <div
            className={twMerge(
              'mt-1 text-pink-secondary text-xs line-clamp-2 leading-[1.2] min-h-7.5',
              classNames?.description
            )}
          >
            {description}
          </div>
        )}
      </SkeletonSuspense>

      {qualitySelectorProps && (
        <div className="mt-2">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="rounded-rectangle" className="h-8 w-23.25" />}
          >
            <div onClick={e => e.stopPropagation()}>
              <QuantitySelector {...qualitySelectorProps} />
            </div>
          </SkeletonSuspense>
        </div>
      )}
      {children && <div className={twMerge('mt-1 flex-1', classNames?.children)}>{children}</div>}

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="card" className="h-10 mt-2" />}
      >
        <div className={twMerge('flex gap-2 mt-2')}>
          {prices.map((price, index) => (
            <Button
              key={index}
              onClick={e => {
                e.stopPropagation();
                onBuy?.(price);
              }}
              disabled={disabled}
              variant={price.type === MarketPriceType.USDT ? 'secondary' : 'primary'}
              className={twMerge(
                'w-full flex-center gap-1 py-2 h-10 text-sm font-semibold rounded-lg',
                classNames?.button
              )}
            >
              {disabled ? (
                <Image src={icons.lock} alt="lock" className="w-auto h-5 object-contain" />
              ) : (
                <>
                  <span className="text-sm font-semibold">{price.amount}</span>
                  {price.type === MarketPriceType.LTC && (
                    <span className="text-sm text-gold font-bold">{GlobalConstants.coinName}</span>
                  )}
                  {price.type === MarketPriceType.USDT && (
                    <span className="text-sm text-emerald-400 font-bold">USDT</span>
                  )}
                </>
              )}
            </Button>
          ))}
        </div>
      </SkeletonSuspense>
    </div>
  );
}
