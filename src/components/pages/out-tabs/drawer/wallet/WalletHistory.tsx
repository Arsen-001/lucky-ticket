'use client';

import type React from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetExchangeHistoryQuery } from '@/api/exchange.api';
import { formatDate } from '@/utils/global/date.utils';
import { twMerge } from 'tailwind-merge';
import { ExchangeStatus, ExchangeType } from '@/types/enums/exchnage.enums';
import { GlobalConstants } from '@/constants/global.constants';
import type { ExchangeHistoryItem } from '@/types/interfaces/exchange.interfaces';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

const STATUS_STYLES: Record<ExchangeStatus, string> = {
  [ExchangeStatus.COMPLETED]: 'bg-success/20 text-success border border-success/40',
  [ExchangeStatus.PENDING]: 'bg-warning/20 text-warning border border-warning/40',
  [ExchangeStatus.FAILED]: 'bg-error/20 text-error border border-error/40',
};

function HistoryRow({
  item,
  loading,
  style,
}: {
  item?: ExchangeHistoryItem;
  loading?: boolean;
  style?: React.CSSProperties;
}) {
  const t = useAppTranslations();

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

  const currencies = item ? getCurrencies(item.type) : { pay: '', received: '' };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-background-overlay/60 animate-slide-in-bottom"
      style={style}
    >
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="flex-1 rounded-md" />}
      >
        <span className="flex-1 text-xs text-white-secondary truncate">
          {item ? `${item.payAmount} ${currencies.pay}` : ''}
        </span>
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="flex-1 rounded-md" />}
      >
        <span className="flex-1 text-xs text-white font-medium truncate">
          {item ? `${item.receivedAmount} ${currencies.received}` : ''}
        </span>
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="flex-1 rounded-full" />}
      >
        <div
          className={twMerge(
            'flex-1 text-[10px] uppercase tracking-wider p-0.5  rounded-full font-semibold text-center',
            item ? STATUS_STYLES[item.status] : ''
          )}
        >
          {item ? t(item.status.toLowerCase() as 'completed' | 'pending' | 'failed') : ''}
        </div>
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="flex-1 rounded-md" />}
      >
        <span className="flex-1 text-[10px] text-gray-400 text-right flex flex-col items-end justify-center">
          <span>{item ? formatDate(item.date, 'DD.MM.YY') : ''}</span>
          <span>{item ? formatDate(item.date, 'HH:mm') : ''}</span>
        </span>
      </SkeletonSuspense>
    </div>
  );
}

export const WalletHistory = ({ className }: { className?: string }) => {
  const t = useAppTranslations();
  const { data: history = [], isLoading } = useGetExchangeHistoryQuery();

  return (
    <div className={twMerge('flex-available flex flex-col gap-3 -mx-5 w-screen', className)}>
      <h3 className="text-center text-lg font-bold px-1">{t('exchange history')}</h3>

      <div className="flex flex-col gap-1 px-5">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <span className="flex-1 text-[10px] font-bold text-white-secondary uppercase tracking-wide">
            {t('paid')}
          </span>
          <span className="flex-1 text-[10px] font-bold text-white-secondary uppercase tracking-wide">
            {t('received')}
          </span>
          <span className="flex-1 text-[10px] font-bold text-white-secondary uppercase tracking-wide text-center">
            {t('status')}
          </span>
          <span className="flex-1 text-[10px] font-bold text-white-secondary uppercase tracking-wide text-right">
            {t('date')}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <HistoryRow key={`loading_${index}`} loading />
            ))
          ) : history.length === 0 ? (
            <EmptyDataInfo description={t('no exchange history')} />
          ) : (
            history.map((item, index) => (
              <HistoryRow key={item.id} item={item} style={{ animationDelay: `${index * 50}ms` }} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
