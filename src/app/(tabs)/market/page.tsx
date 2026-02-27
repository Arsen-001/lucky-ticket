import { MarketTabs } from '@/components/pages/tabs/market/MarketTabs';
import { Suspense } from 'react';

export default function MarketPage() {
  return (
    <div className="p-5 flex-col-stretch gap-10">
      <Suspense>
        <MarketTabs className="mt-6" />
      </Suspense>
    </div>
  );
}
