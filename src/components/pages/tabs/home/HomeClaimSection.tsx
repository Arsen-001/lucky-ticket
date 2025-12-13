import { Tabs, type TabsProps } from '@/components/shared/Tabs';
import { PartnersComingSoon } from '@/components/pages/tabs/home/PartnersComingSoon';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { twMerge } from 'tailwind-merge';

export async function HomeClaimSection({ className }: ClassNameProps) {
  const t = await getAppTranslations();

  const tabs: TabsProps['items'] = [
    {
      key: 'main',
      title: t('main'),
    },
    {
      key: 'partners',
      title: t('partners'),
      children: <PartnersComingSoon />,
    },
  ];

  return (
    <div className={twMerge('h-full flex-col-stretch p-5', className)}>
      <Tabs
        defaultActiveKey={tabs[1].key}
        classNames={{ tab: 'w-30', children: 'flex-1 flex-col-stretch' }}
        items={tabs}
      />
    </div>
  );
}
