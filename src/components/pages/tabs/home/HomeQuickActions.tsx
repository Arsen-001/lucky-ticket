'use client';

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { useGetTasksQuery } from '@/api/tasks.api';
import { Link } from '@/components/shared/links/Link';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { icons } from '@/constants/icons';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { TaskCategoryType } from '@/types/enums/tasks.enums';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { Route } from '@/constants/routes';

interface QuickActionCardProps {
  href: Route;
  iconClass: string;
  iconNode: React.ReactNode;
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}

function QuickActionCard({
  href,
  iconClass,
  iconNode,
  label,
  value,
  loading,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="card-outlined bg-purple-gradient flex items-center gap-2.5 rounded-xl p-3 transition-transform active:scale-99"
    >
      <div className={twMerge('flex-center h-9.5 w-9.5 flex-shrink-0 rounded-lg', iconClass)}>
        {iconNode}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-pink-secondary text-xs font-semibold leading-none">{label}</span>
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-16" />}
        >
          <div className="text-sm font-bold leading-tight text-white">{value}</div>
        </SkeletonSuspense>
      </div>
    </Link>
  );
}

export function HomeQuickActions({ className }: ClassNameProps) {
  const t = useAppTranslations();
  const { data: tasksData, isLoading } = useGetTasksQuery();

  const dailyResetDate = useMemo(() => {
    const next = new Date();
    next.setHours(24, 0, 0, 0);
    return next.toISOString();
  }, []);
  const { leftTime, expired } = useCountDown(dailyResetDate);

  const dailyTasks = tasksData?.[TaskCategoryType.DAILY]?.items ?? [];
  const completedDailyCount = dailyTasks.filter(task => task.claimed).length;
  const totalDailyCount = dailyTasks.length;

  return (
    <div className={twMerge('grid grid-cols-2 gap-2.5 px-4', className)}>
      <QuickActionCard
        href={routes.wallet}
        iconClass="bg-gold/15"
        iconNode={<Image src={icons.coin} alt="" width={24} height={24} />}
        label={t('daily reward')}
        value={
          <GoldenText className="text-sm font-bold tabular-nums">
            {expired ? t('ready') : leftTime}
          </GoldenText>
        }
      />
      <QuickActionCard
        href={routes.tasks}
        iconClass="bg-electric-pink/15"
        iconNode={<CheckCircle2 size={20} className="text-electric-pink" strokeWidth={2.2} />}
        label={t('daily tasks')}
        value={
          <span className="tabular-nums">
            {completedDailyCount}{' '}
            <span className="text-pink-secondary font-semibold">/ {totalDailyCount}</span>
          </span>
        }
        loading={isLoading}
      />
    </div>
  );
}
