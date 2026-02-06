'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetExchangeHistoryQuery } from '@/api/exchange.api';
import { formatDate } from '@/utils/global/date.utils';
import { twMerge } from 'tailwind-merge';
import { ExchangeStatus, ExchangeType } from '@/types/enums/exchnage.enums';
import { GlobalConstants } from '@/constants/global.constants';
import { ColumnType, Table } from '@/components/shared/Table';
import { ExchangeHistoryItem } from '@/types/interfaces/exchange.interfaces';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';

export const ExchangeHistory = ({ className }: { className?: string }) => {
  const t = useAppTranslations();
  const { data: history = [], isLoading } = useGetExchangeHistoryQuery();

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

  const columns: ColumnType<ExchangeHistoryItem>[] = [
    {
      title: t('paid'),
      dataIndex: 'payAmount',
      render: (value, record) => {
        const { pay } = getCurrencies(record.type);
        return `${value} ${pay}`;
      },
    },
    {
      title: t('received'),
      dataIndex: 'receivedAmount',
      render: (value, record) => {
        const { received } = getCurrencies(record.type);
        return `${value} ${received}`;
      },
    },
    {
      title: t('status'),
      dataIndex: 'status',
      render: value => (
        <div
          className={twMerge(
            'max-w-[24vw] w-full truncate text-[10px] uppercase tracking-wider pb-1 pt-1.5 px-1.5 rounded-full font-semibold ',
            value === ExchangeStatus.COMPLETED && 'bg-success',
            value === ExchangeStatus.PENDING && 'bg-warning',
            value === ExchangeStatus.FAILED && 'bg-error'
          )}
        >
          {t(value.toLowerCase())}
        </div>
      ),
    },
    {
      title: t('date'),
      dataIndex: 'date',
      className: 'text-gray-400 font-normal',
      render: value => formatDate(value, 'DD.MM.YY HH:mm'),
    },
  ];

  return (
    <div className={twMerge('flex flex-col gap-3 -mx-5 -mb-10 w-screen', className)}>
      <h3 className="text-center text-lg font-bold px-1">{t('exchange history')}</h3>
      <Table
        columns={columns}
        dataSource={history}
        isLoading={isLoading}
        rowKey="id"
        emptyText={<EmptyDataInfo description={t('no exchange history')} />}
      />
    </div>
  );
};
