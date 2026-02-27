'use client';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Tabs } from '@/components/shared/Tabs';
import { ArrowBigUp, CircleStar, Tickets } from 'lucide-react';
import { MarketBoostList } from '@/components/pages/tabs/market/boosts/MarketBoostList';
import { MarketTicketList } from '@/components/pages/tabs/market/tickets/MarketTicketList';
import { MarketStatusList } from '@/components/pages/tabs/market/status/MarketStatusList';
import { type HTMLAttributes, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { routes } from '@/constants/routes';

export function MarketTabs({ ...props }: HTMLAttributes<HTMLDivElement>) {
  const t = useAppTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const items = [
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
  ];

  const tabParam = searchParams.get('tab');

  const activeKey = useMemo(() => {
    const matchedItem = items.find(item => item.key.toLowerCase() === tabParam?.toLowerCase());
    return matchedItem ? matchedItem.key : items[0].key;
  }, [tabParam, items]);

  const handleTabChange = (key: string) => {
    router.replace(routes.market(key));
  };

  return (
    <div {...props}>
      <Tabs
        classNames={{ tab: 'flex-center gap-1 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:stroke-2' }}
        activeKey={activeKey}
        onTabChange={handleTabChange}
        items={items}
      />
    </div>
  );
}
