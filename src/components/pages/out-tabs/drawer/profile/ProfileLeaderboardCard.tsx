'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
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

interface BestRecord {
  period: ActivityBestPeriod;
  points: number;
  rank: number;
}

const PERIOD_KEY: Record<ActivityBestPeriod, 'day' | 'weekly' | 'all time'> = {
  day: 'day',
  week: 'weekly',
  all_time: 'all time',
};

const pickBest = (best: ProfileResponse['activityBest'] | undefined): BestRecord => {
  const candidates: BestRecord[] = [
    { period: 'all_time', points: best?.allTime ?? 0, rank: best?.allTimeRank ?? 0 },
    { period: 'week', points: best?.week ?? 0, rank: best?.weekRank ?? 0 },
    { period: 'day', points: best?.day ?? 0, rank: best?.dayRank ?? 0 },
  ];
  return candidates.reduce((winner, current) =>
    current.points > winner.points ? current : winner
  );
};

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

  const best = pickBest(profile.activityBest);
  const hasRank = best.rank > 0;

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
            'bg-background-overlay relative flex items-center gap-3 rounded-2xl p-3 text-left transition-all',
            'cursor-pointer active:scale-99 hover:bg-white/4'
          )}
        >
          <BoltIcon size={60} className="shrink-0" />

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/50">
              {t('activity')}
            </span>
            <span className="text-gold text-lg font-black leading-none tabular-nums">
              {formatNumber(profile.activityPoints)}
            </span>
            {hasRank && (
              <span className="text-[10px] font-bold tracking-wider text-white/45">
                {t(PERIOD_KEY[best.period])} · #{best.rank}
              </span>
            )}
          </div>

          <ChevronRight size={18} className="shrink-0 text-white/35" />
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
