'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLeaderboardEnabled } from '@/hooks/useLeaderboardEnabled';
import { routes } from '@/constants/routes';
import { formatNumber } from '@/utils/global/number.utils';
import type { ProfileResponse } from '@/types/interfaces/profile.interfaces';

export interface ProfileLeaderboardCardProps {
  profile?: ProfileResponse;
  loading?: boolean;
}

export function ProfileLeaderboardCard({ profile, loading }: ProfileLeaderboardCardProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Board still shut for the test period (§16.4): the player's own AP and rank
  // stay visible, but the card leads nowhere until the leaderboard opens.
  const leaderboardEnabled = useLeaderboardEnabled();

  const showSkeleton = loading || !profile;
  // Ranking is by lifetime Activity Points (the backend tracks no period
  // windows), so the card shows the single all-time standing.
  const { allTime = 0, allTimeRank = 0 } = profile?.activityBest ?? {};

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
          disabled={showSkeleton || !leaderboardEnabled}
          aria-label={leaderboardEnabled ? t('view leaderboard') : t('leaderboard locked title')}
          className={twMerge(
            'bg-background-overlay relative flex items-center gap-2.5 rounded-2xl p-0 text-left transition-all',
            !showSkeleton && leaderboardEnabled && 'cursor-pointer active:scale-99 hover:bg-white/4'
          )}
        >
          <div className="flex-center shrink-0 overflow-hidden">
            <BoltIcon size={80} className="m-0 p-0" />
          </div>

          <div className="-ml-4 flex flex-1 items-center justify-between py-3 pr-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/45">
                {t('activity points')}
              </span>
              <SkeletonSuspense
                loading={showSkeleton}
                skeleton={<Skeleton variant="line" textSize="2xl" className="h-6 w-16" />}
              >
                <span className="text-gold text-2xl font-black leading-none tabular-nums">
                  {formatNumber(allTime)}
                </span>
              </SkeletonSuspense>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/45">
                {t('rank')}
              </span>
              <SkeletonSuspense
                loading={showSkeleton}
                skeleton={<Skeleton variant="line" textSize="xl" className="h-5 w-10" />}
              >
                <span className="text-xl font-black leading-none tabular-nums text-white">
                  {allTimeRank > 0 ? `#${allTimeRank}` : '—'}
                </span>
              </SkeletonSuspense>
            </div>
          </div>
        </button>

        {!leaderboardEnabled && (
          <p className="text-white-secondary/60 flex items-center gap-1.5 px-1 text-[11px] font-medium leading-snug">
            <Lock size={11} className="shrink-0 text-white/35" />
            {t('leaderboard locked description')}
          </p>
        )}
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
