'use client';

import { MarketBoostList } from '@/components/pages/tabs/market/MarketBoostList';
import { MarketTicketList } from '@/components/pages/tabs/market/MarketTicketList';
import { MarketStatusList } from '@/components/pages/tabs/market/MarketStatusList';

export default function MarketPage() {
  return (
    <div className="p-5 flex-col-stretch gap-10">
      <MarketBoostList />
      <MarketTicketList />
      <MarketStatusList />
    </div>
  );
}
