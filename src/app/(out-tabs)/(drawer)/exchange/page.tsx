import { ExchangeOffersSection } from '@/components/pages/out-tabs/drawer/exchange/ExchangeOffersSection';
import { ExchangeHistory } from '@/components/pages/out-tabs/drawer/exchange/ExchangeHistory';

export default function ExchangePage() {
  return (
    <div className="flex flex-col gap-20">
      <ExchangeOffersSection />
      <ExchangeHistory />
    </div>
  );
}
