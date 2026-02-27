'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Button } from '@/components/shared/buttons/Button';
import type { ExchangeOffer } from '@/types/interfaces/exchange.interfaces';
import { useGetMeQuery } from '@/api/me.api';

import { ExchangeType } from '@/types/enums/exchnage.enums';
import { GlobalConstants } from '@/constants/global.constants';
import { MoveRight } from 'lucide-react';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

interface ExchangeOfferCardProps {
  offer: ExchangeOffer;
  loading?: boolean;
  onExchange?: (offer: ExchangeOffer) => void;
  isExchanging?: boolean;
}

export const WalletOfferCard = ({
  loading,
  offer,
  onExchange,
  isExchanging,
}: ExchangeOfferCardProps) => {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();

  const canExchange = me ? me.coins >= offer?.payAmount : false;

  const getCurrencies = (type: ExchangeType) => {
    switch (type) {
      case ExchangeType.LTC_TO_USDT:
        return { pay: GlobalConstants.coinName, received: 'USDT' };
      case ExchangeType.USDT_TO_LTC:
        return { pay: 'USDT', received: GlobalConstants.coinName };
      default:
        return { pay: '', received: '' };
    }
  };

  const { pay: payCurrency, received: receivedCurrency } = getCurrencies(offer?.type);

  return (
    <div className="flex items-center justify-between p-4 gap-2 bg-background-overlay rounded-2xl ">
      <div className="flex items-center gap-2">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton textSize="base" className="w-13" />}
        >
          <span className="text-sm font-medium text-gray-400">
            {offer?.payAmount} {payCurrency}
          </span>
        </SkeletonSuspense>
        <MoveRight />
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton textSize="base" className="w-16" />}
        >
          <span className="font-semibold text-white">
            {offer?.receivedAmount} {receivedCurrency}
          </span>
        </SkeletonSuspense>
      </div>
      <Button
        variant="primary"
        disabled={!canExchange}
        loading={isExchanging}
        onClick={() => onExchange?.(offer)}
        className="py-1.5 px-4 text-sm truncate max-w-5/12"
        iconSize={16}
      >
        {t('exchange')}
      </Button>
    </div>
  );
};
