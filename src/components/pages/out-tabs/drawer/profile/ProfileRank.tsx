'use client';
import { useGetLeaderboardQuery } from '@/api/leaderboard.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { ArrowDown, ArrowUp, Minus, Trophy } from 'lucide-react';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';

export function ProfileRank() {
  const { data: leaderboard, isLoading } = useGetLeaderboardQuery();
  const t = useAppTranslations();

  const myPlace = leaderboard?.myPlace;

  const renderRankChange = () => {
    if (!myPlace) return null;
    if (myPlace.rankChange > 0) {
      return (
        <div className="flex items-center gap-1 text-green-400 text-xs">
          <ArrowUp size={12} />
          <span>{myPlace.rankChange}</span>
        </div>
      );
    }
    if (myPlace.rankChange < 0) {
      return (
        <div className="flex items-center gap-1 text-red-400 text-xs">
          <ArrowDown size={12} />
          <span>{Math.abs(myPlace.rankChange)}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-white/40 text-xs">
        <Minus size={12} />
        <span>0</span>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-linear-to-br from-yellow-500/10 to-orange-500/10 rounded-2xl p-4 border border-yellow-500/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-white/60 text-sm">{t('global rank')}</p>
            <SkeletonSuspense
              loading={isLoading}
              skeleton={<Skeleton variant="line" className="w-16 h-6 mt-1" />}
            >
              <p className="text-xl font-bold text-white">#{myPlace?.place || '-'}</p>
            </SkeletonSuspense>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <SkeletonSuspense
            loading={isLoading}
            skeleton={<Skeleton variant="line" className="w-10 h-4" />}
          >
            {renderRankChange()}
          </SkeletonSuspense>
          <p className="text-white/40 text-[10px] uppercase tracking-wider text-right">
            {t('rank change')}
          </p>
        </div>
      </div>
    </div>
  );
}
