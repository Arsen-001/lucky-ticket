'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketBoostList } from '@/components/pages/tabs/market/MarketBoostList';
import { MarketTicketList } from '@/components/pages/tabs/market/MarketTicketList';
import { MarketStatusList } from '@/components/pages/tabs/market/MarketStatusList';
import { Tabs } from '@/components/shared/Tabs';
import { PremiumBonusInfo } from '@/components/pages/tabs/tasks/PremiumBonusInfo';

export default function MarketPage() {
  const t = useAppTranslations();

  const tabs = [
    {
      key: 'boosts',
      title: t('boosts'),
      children: <MarketBoostList />,
    },
    {
      key: 'tickets',
      title: t('tickets'),
      children: <MarketTicketList />,
    },
    {
      key: 'statuses',
      title: t('statuses'),
      children: <MarketStatusList />,
    },
  ];

  return (
    <div className="px-5">
      <div className=" mt-7 mb-6">
        <PremiumBonusInfo />
      </div>
      <Tabs items={tabs} defaultActiveKey="boosts" />
    </div>
  );
}
