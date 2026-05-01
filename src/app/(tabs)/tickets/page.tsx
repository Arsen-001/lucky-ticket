import { TicketsList } from '@/components/pages/tabs/tickets/TicketsList';
import { Tabs, type TabsProps } from '@/components/shared/Tabs';
import { PartnersComingSoon } from '@/components/pages/tabs/home/PartnersComingSoon';
import { getAppTranslations } from '@/i18n/getAppTranslations';

export default async function TicketsPage() {
  const t = await getAppTranslations();

  const tabs: TabsProps['items'] = [
    {
      key: 'main',
      title: t('main'),
      children: (
        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          <TicketsList />
        </div>
      ),
    },
    {
      key: 'partners',
      title: t('partners'),
      children: <PartnersComingSoon />,
    },
  ] as const;

  return (
    <div className="py-8 px-5">
      <Tabs
        defaultActiveKey={tabs[0].key}
        classNames={{
          tab: 'min-w-30',
          children: 'flex-1 flex-col-stretch mt-6',
        }}
        items={tabs}
      />
    </div>
  );
}
