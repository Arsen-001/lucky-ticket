'use client';

import Image from 'next/image';
import { ChevronRight, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetStakesQuery } from '@/api/stakes.api';
import { Link } from '@/components/shared/links/Link';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { HomeSectionHeader } from '@/components/pages/tabs/home/HomeSectionHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import {
  computeStakeProgress,
  isStakeReady,
  sortStakesReadyFirst,
} from '@/utils/global/stakes.utils';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { routes } from '@/constants/routes';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';

export function HomeActiveStakeCard({ className }: ClassNameProps) {
  const t = useAppTranslations();
  const { data, isLoading } = useGetStakesQuery();

  const stake = data?.activeStakes?.length ? sortStakesReadyFirst(data.activeStakes)[0] : undefined;
  const levelDef = stake ? data?.levels.find(l => l.level === stake.level) : undefined;

  const ready = stake ? isStakeReady(stake.endDate) : false;
  const progress = stake ? computeStakeProgress(stake.startDate, stake.endDate) : 0;
  const { leftTime } = useCountDown(stake?.endDate);

  if (!isLoading && !stake) {
    return (
      <div className={twMerge('flex flex-col gap-3', className)}>
        <HomeSectionHeader title={t('active stake')} />
        <div className="px-4">
          <Link
            href={routes.stakes.new}
            className="border-electric-purple/30 bg-electric-purple/8 flex items-center gap-3 rounded-2xl border border-dashed px-4 py-3.5 transition-transform active:scale-99"
          >
            <div className="bg-electric-purple/20 flex-center h-10 w-10 flex-shrink-0 rounded-full">
              <Lock size={18} className="text-electric-purple" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-bold text-white">{t('no active stakes')}</span>
              <span className="text-pink-secondary text-xs">{t('lock LC earn rewards')}</span>
            </div>
            <span className="bg-pink-gradient inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
              {t('start a stake')}
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const href = stake
    ? ready
      ? routes.stakes.getReadyById(stake.id)
      : routes.stakes.getById(stake.id)
    : routes.stakes.index;

  const tier = levelDef?.guaranteedTicket;
  const tierLabel = tier
    ? `${t(tier as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond')}`
    : '';

  return (
    <div className={twMerge('flex flex-col gap-3', className)}>
      <HomeSectionHeader
        title={t('active stake')}
        actionLabel={t('see all')}
        actionHref={routes.stakes.index}
      />
      <div className="px-4">
        <Link
          href={href}
          className="card-outlined bg-purple-gradient block rounded-2xl p-3.5 transition-transform active:scale-99"
        >
          <div className="flex items-center gap-3">
            <div
              className={twMerge(
                'flex-center h-11 w-11 flex-shrink-0 rounded-xl',
                ready
                  ? 'bg-success/25 border border-success/40'
                  : 'bg-electric-purple/20 border border-electric-purple/30'
              )}
            >
              <Lock size={20} className={ready ? 'text-success' : 'text-electric-purple'} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
                {ready ? t('ready') : t('stake in progress')}
              </span>
              <SkeletonSuspense
                loading={isLoading}
                skeleton={<Skeleton variant="line" textSize="sm" className="h-5 w-32" />}
              >
                <div className="flex items-baseline gap-1.5">
                  <Image src={icons.coin} alt="" width={14} height={14} className="self-center" />
                  <span className="text-gold text-base font-extrabold leading-none tabular-nums">
                    {stake?.lockedAmount.toLocaleString()}
                  </span>
                  <GoldenText className="text-[11px] font-bold">
                    {GlobalConstants.coinName}
                  </GoldenText>
                  {levelDef && (
                    <span className="text-pink-secondary ml-auto truncate text-[11px] font-semibold">
                      {t('level {level}', { level: levelDef.level })} · {tierLabel}
                    </span>
                  )}
                </div>
              </SkeletonSuspense>
            </div>
          </div>

          <div className="bg-background-overlay/70 mt-3 h-1.5 overflow-hidden rounded-full">
            <div
              className={twMerge(
                'h-full rounded-full transition-all duration-500',
                ready ? 'bg-success' : 'bg-pink-gradient'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-pink-secondary mt-2 flex items-center justify-between text-[11px] font-semibold tabular-nums">
            <span>{progress}%</span>
            <span>{ready ? t('claim now') : leftTime}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
