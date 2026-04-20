'use client';
import { Copy, UserPlus2, Users } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetReferralStatsQuery } from '@/api/referral.api';
import { CopyButton } from '@/components/shared/buttons/CopyButton';
import { getRefererLink } from '@/utils/pages/referral.utils';
import { useGetMeQuery } from '@/api/me.api';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export const ReferralStatsCard = () => {
  const t = useAppTranslations();
  const { data: stats, isLoading: isStatsLoading } = useGetReferralStatsQuery();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();

  const link = getRefererLink(me?.id);

  return (
    <div className="flex flex-col gap-3 p-4 bg-purple-gradient rounded-2xl">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="min-w-3.5 w-3.5 aspect-square" />
          <span className="text-sm font-medium uppercase tracking-wider">{t('invited')}</span>
        </div>
        <SkeletonSuspense
          loading={isStatsLoading}
          skeleton={<Skeleton textSize="lg" className="w-10" />}
        >
          <span className="text-xl font-semibold">{stats?.totalInvited}</span>
        </SkeletonSuspense>
      </div>

      <div className="flex gap-2">
        <CopyButton
          variant="primary"
          loading={isMeLoading}
          value={link}
          className="flex-1 flex-center gap-2 text-white rounded-xl font-semibold text-sm h-11"
          icon={<UserPlus2 size={16} />}
        >
          {t('invite friends')}
        </CopyButton>
        <CopyButton
          variant="secondary"
          loading={isMeLoading}
          value={link}
          className="h-11 w-11 shrink-0 p-0 flex-center rounded-xl"
          aria-label={t('copy invite link')}
        >
          <Copy size={16} />
        </CopyButton>
      </div>
    </div>
  );
};
