'use client';
import { useGetMeQuery } from '@/api/me.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { GlobalConstants } from '@/constants/global.constants';
import { ChevronsUp, Wallet } from 'lucide-react';

export function ProfileStats() {
  const { data: me, isLoading } = useGetMeQuery();
  const t = useAppTranslations();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 rounded-2xl p-5 flex flex-col gap-1 items-center border border-white/10 transition-transform cursor-pointer hover:bg-white/10">
        <div className="flex items-center gap-1.5 text-white/60 text-xs uppercase tracking-wider font-semibold">
          <Wallet className="h-4.5 w-4.5 text-gold" />
          <div className="font-semibold h-3.5">{t('balance')}</div>
        </div>
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className="w-20" />}
        >
          <div className="flex-center gap-2 items-center">
            <span className="text-lg font-black text-white">{me?.coins?.toLocaleString()}</span>
            <span className="text-xs font-bold uppercase mt-1 text-gold">
              {GlobalConstants.coinName}
            </span>
          </div>
        </SkeletonSuspense>
      </div>

      <div className="bg-white/5 rounded-2xl p-5 flex flex-col gap-1 items-center border border-white/10 transition-transform cursor-pointer hover:bg-white/10">
        <div className="flex items-center gap-1 text-white/60 text-xs uppercase tracking-wider font-semibold">
          <ChevronsUp className="w-5 h-5 text-gold" />
          <div className="font-semibold h-3.5">{t('activity')}</div>
        </div>
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className="w-20" />}
        >
          <div className="flex-center gap-2 items-center">
            <span className="text-lg font-black text-white">{me?.points?.toLocaleString()}</span>
            <span className="text-xs text-gold font-bold uppercase mt-1">Points</span>
          </div>
        </SkeletonSuspense>
      </div>
    </div>
  );
}
