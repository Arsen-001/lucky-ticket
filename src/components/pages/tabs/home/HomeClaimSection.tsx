import { Tabs, type TabsProps } from '@/components/shared/Tabs';
import { PartnersComingSoon } from '@/components/pages/tabs/home/PartnersComingSoon';
import { getAppTranslations } from '@/i18n/getAppTranslations';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { twMerge } from 'tailwind-merge';
import { HomeEnginesSlider } from '@/components/pages/tabs/home/HomeEnginesSlider';
import type { CSSProperties } from 'react';

export async function HomeClaimSection({
  className,
  style,
}: ClassNameProps & { style?: CSSProperties }) {
  const t = await getAppTranslations();

  const tabs: TabsProps['items'] = [
    {
      key: 'main',
      title: t('main'),
      children: (
        <div className="flex-available overflow-y-auto scrollbar-hidden py-2.5">
          <HomeEnginesSlider />
        </div>
      ),
    },
    {
      key: 'partners',
      title: t('partners'),
      children: (
        <div className=" flex-1 flex-col-stretch pb-5 pt-2.5">
          <PartnersComingSoon />
        </div>
      ),
    },
  ] as const;

  return (
    <div style={style} className={twMerge('h-full flex-col-stretch', className)}>
      <Tabs
        defaultActiveKey={tabs[0].key}
        classNames={{
          tab: 'min-w-30',

          children: 'px-5 mt-3 inset-container-background',
        }}
        className="mt-5"
        items={tabs}
      />
    </div>
  );
}
