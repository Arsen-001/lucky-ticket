import { SupportChannelCard } from '@/components/pages/out-tabs/drawer/support/SupportChannelCard';
import { SupportHeroCard } from '@/components/pages/out-tabs/drawer/support/SupportHeroCard';
import { SupportTelegramCard } from '@/components/pages/out-tabs/drawer/support/SupportTelegramCard';

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <SupportHeroCard />
      <SupportTelegramCard />
      <SupportChannelCard />
    </div>
  );
}
