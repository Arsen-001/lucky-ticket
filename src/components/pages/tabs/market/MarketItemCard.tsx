'use client';

import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import Image from 'next/image';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { StaticImport } from 'next/dist/shared/lib/get-img-props';

interface MarketItemCardProps {
  title: string;
  description?: string;
  price: number;
  currency?: 'LTC' | 'USD';
  icon?: string | StaticImport;
  iconComponent?: ReactNode;
  onBuy?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function MarketItemCard({
  title,
  description,
  price,
  currency = 'LTC',
  icon,
  iconComponent,
  onBuy,
  isLoading,
  disabled,
  children,
  className,
}: MarketItemCardProps) {
  const t = useAppTranslations();

  if (isLoading) {
    return (
      <div className={twMerge('bg-purple-gradient rounded-lg p-3 flex flex-col gap-2', className)}>
        <div className="flex items-center gap-3">
          <Skeleton variant="rounded-rectangle" className="w-12 h-12" />
          <div className="flex flex-col gap-1 flex-1">
            <Skeleton variant="line" className="w-24" textSize="sm" />
            <Skeleton variant="line" className="w-32" textSize="xs" />
          </div>
        </div>
        <Skeleton variant="card" className="h-10 w-full mt-2" />
      </div>
    );
  }

  return (
    <div className={twMerge('bg-purple-gradient rounded-lg p-3 flex flex-col gap-2', className)}>
      <div className="flex items-center gap-3">
        {(icon || iconComponent) && (
          <div className="bg-white/5 rounded-lg p-2 shrink-0 w-12 h-12 flex-center">
            {iconComponent
              ? iconComponent
              : icon && <Image src={icon} alt={title} width={40} height={40} />}
          </div>
        )}
        <div className="flex flex-col flex-1 overflow-hidden">
          <span className="text-sm font-bold text-white truncate">{title}</span>
          {description && <span className="text-xs text-white/60 truncate">{description}</span>}
        </div>
      </div>

      {children}

      <Button
        onClick={onBuy}
        disabled={disabled}
        className="w-full mt-1 py-2 h-auto text-xs font-bold"
      >
        <div className="flex-center gap-1.5">
          {t('pay')} {price}{' '}
          {currency === 'LTC' ? (
            <Image src={icons.coin} alt="coin" width={14} height={14} />
          ) : (
            currency
          )}
        </div>
      </Button>
    </div>
  );
}
