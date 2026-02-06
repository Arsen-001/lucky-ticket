'use client';
import { useGetReferralStatsQuery } from '@/api/referral.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { CheckCircle2, Ticket, Trophy, Users } from 'lucide-react';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';

export function ProfilePerformance() {
  const { data: referralStats, isLoading: isReferralLoading } = useGetReferralStatsQuery();
  const t = useAppTranslations();

  const stats = [
    {
      label: t('invited friends'),
      value: referralStats?.totalInvited ?? 0,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: t('joined tournaments'),
      value: 12,
      icon: Trophy,
      color: 'bg-yellow-500/10 text-yellow-400',
    },
    {
      label: t('collected tickets'),
      value: 154,
      icon: Ticket,
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      label: t('completed tasks'),
      value: 45,
      icon: CheckCircle2,
      color: 'bg-green-500/10 text-green-400',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold text-white px-1">{t('performance metrics')}</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-2xl p-4 flex flex-col gap-3 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex h-full flex-col gap-1 justify-between">
              <div className="text-white/40 text-xs uppercase tracking-wider font-semibold line-clamp-2 text-center">
                {stat.label}
              </div>

              <div className="flex-center gap-2">
                <SkeletonSuspense
                  loading={isReferralLoading}
                  skeleton={<Skeleton variant="line" className="w-8 h-6" />}
                >
                  <div className="text-xl font-black text-white h-6">{stat.value}</div>
                </SkeletonSuspense>
                <div
                  className={`p-1.5 w-fit  rounded-lg ${stat.color} flex items-center justify-center`}
                >
                  <stat.icon size={14} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
