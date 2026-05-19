'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { formatNumber } from '@/utils/global/number.utils';
import type { ActivityBestPeriod, ProfileResponse } from '@/types/interfaces/profile.interfaces';

export interface ProfileLeaderboardCardProps {
  profile?: ProfileResponse;
  loading?: boolean;
}

type PeriodLabelKey = 'today' | 'weekly' | 'monthly' | 'all time';

interface PeriodCell {
  period: ActivityBestPeriod;
  labelKey: PeriodLabelKey;
  points: number;
  rank: number;
}

const buildCells = (best: ProfileResponse['activityBest']): PeriodCell[] => [
  { period: 'day', labelKey: 'today', points: best.day, rank: best.dayRank },
  { period: 'week', labelKey: 'weekly', points: best.week, rank: best.weekRank },
  { period: 'month', labelKey: 'monthly', points: best.month, rank: best.monthRank },
  { period: 'all_time', labelKey: 'all time', points: best.allTime, rank: best.allTimeRank },
];

export function ProfileLeaderboardCard({ profile, loading }: ProfileLeaderboardCardProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (loading || !profile) {
    return (
      <section className="flex flex-col gap-2.5">
        <h3 className="px-1 text-base font-extrabold text-white">{t('leaderboard')}</h3>
        <Skeleton variant="rounded-rectangle" className="h-20 w-full" />
      </section>
    );
  }

  const cells = buildCells(profile.activityBest);

  const handleConfirm = () => {
    setOpen(false);
    router.push(routes.leaderboard);
  };

  return (
    <>
      <section className="flex flex-col gap-2.5">
        <h3 className="px-1 text-base font-extrabold text-white">{t('leaderboard')}</h3>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('view leaderboard')}
          className={twMerge(
            'bg-background-overlay relative flex items-center gap-2.5 rounded-2xl p-0 text-left transition-all',
            'cursor-pointer active:scale-99 hover:bg-white/4'
          )}
        >
          <div className="flex-center shrink-0 overflow-hidden">
            <BoltIcon size={80} className="m-0 p-0" />
          </div>

          <div className="-ml-6 grid flex-1 grid-cols-4 items-center">
            {cells.map((cell, index) => (
              <div
                key={cell.period}
                className={twMerge(
                  'flex flex-col items-center gap-1 px-1.5 py-1.5',
                  index < cells.length - 1 && 'border-r border-white/8'
                )}
              >
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/45">
                  {t(cell.labelKey)}
                </span>
                <span className="text-gold text-base font-black leading-none tabular-nums">
                  {formatNumber(cell.points)}
                </span>
                <span className="text-[10px] font-bold tabular-nums text-white/55">
                  {cell.rank > 0 ? `#${cell.rank}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </button>
      </section>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={t('view leaderboard')}
        content={<p className="text-sm text-white/80">{t('view leaderboard description')}</p>}
        confirmText={t('view leaderboard')}
      />
    </>
  );
}
