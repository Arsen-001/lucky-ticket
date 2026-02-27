import { WalletOffersSection } from '@/components/pages/out-tabs/drawer/wallet/WalletOffersSection';
import { WalletHistory } from '@/components/pages/out-tabs/drawer/wallet/WalletHistory';

export default function WalletPage() {
  return (
    <div className="flex flex-col h-full gap-20">
      <WalletOffersSection />
      <WalletHistory />
    </div>
  );
}
