'use client';

import { Tabs } from '@/components/shared/Tabs';
import { TaskFrequency } from '@/types/enums/tasks.enums';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TasksFrequencyTabsProps {
  active: TaskFrequency;
  onChange: (frequency: TaskFrequency) => void;
  counts: Record<TaskFrequency, number>;
  className?: string;
}

export function TasksFrequencyTabs({
  active,
  onChange,
  counts,
  className,
}: TasksFrequencyTabsProps) {
  const t = useAppTranslations();

  const renderTab = (label: string, ready: number) => (
    <span className="inline-flex items-center justify-center gap-1.5 leading-none">
      <span className="mt-[2px] capitalize leading-none">{label}</span>
      {ready > 0 && (
        <span className="flex-center min-w-4 h-4 px-1 rounded-full bg-electric-pink text-[10px] font-bold text-white tabular-nums">
          {ready}
        </span>
      )}
    </span>
  );

  return (
    <div className={className}>
      <Tabs
        activeKey={active}
        onTabChange={key => onChange(key as TaskFrequency)}
        hideMountAnimation
        items={[
          {
            key: TaskFrequency.DAILY,
            title: renderTab(t('daily'), counts[TaskFrequency.DAILY]),
          },
          {
            key: TaskFrequency.WEEKLY,
            title: renderTab(t('weekly'), counts[TaskFrequency.WEEKLY]),
          },
          {
            key: TaskFrequency.ONCE,
            title: renderTab(t('one time'), counts[TaskFrequency.ONCE]),
          },
        ]}
        classNames={{
          container: 'mx-4 !w-auto',
          tab: 'flex-1 !w-auto !text-xs !px-3 !py-1',
          scrollButtons: '!hidden',
        }}
      />
    </div>
  );
}
