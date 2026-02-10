'use client';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Tabs } from '@/components/shared/Tabs';
import { ArrowBigUp, CircleStar, Tickets } from 'lucide-react';
import { MarketBoostList } from '@/components/pages/tabs/market/MarketBoostList';
import { MarketTicketList } from '@/components/pages/tabs/market/MarketTicketList';
import { MarketStatusList } from '@/components/pages/tabs/market/MarketStatusList';
import type { HTMLAttributes } from 'react';

export function MarketTabs({ ...props }: HTMLAttributes<HTMLDivElement>) {
  const t = useAppTranslations();
  return (
    <div {...props}>
      <Tabs
        classNames={{ tab: 'flex-center gap-1 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:stroke-2' }}
        items={[
          {
            key: 'Boosts',
            title: (
              <>
                {<ArrowBigUp />}
                {t('boosts')}
              </>
            ),
            children: <MarketBoostList />,
          },
          {
            key: 'Tickets',
            title: (
              <>
                <Tickets />
                {t('tickets')}
              </>
            ),
            children: <MarketTicketList />,
          },
          {
            key: 'Status',
            title: (
              <>
                <CircleStar />
                {t('status')}
              </>
            ),
            children: <MarketStatusList />,
          },
        ]}
      />
    </div>
  );
}
