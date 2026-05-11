import { MarketView } from '@/components/pages/tabs/market/MarketView';
import { Suspense } from 'react';

export default function MarketPage() {
  return (
    <div className="flex-col-stretch gap-4 pt-3 pb-6">
      <Suspense>
        <MarketView />
      </Suspense>
    </div>
  );
}
