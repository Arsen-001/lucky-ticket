'use client';
import { Copy, Users, Wallet } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { useClaimMutation, useGetReferralStatsQuery } from '@/api/referral.api';
import { CopyButton } from '@/components/shared/buttons/CopyButton';
import { getRefererLink } from '@/utils/pages/referral.utils';
import { useGetMeQuery } from '@/api/me.api';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Button } from '@/components/shared/buttons/Button';
import { Divider } from '@/components/shared/Divider';

export const ReferralStatsCard = () => {
  const t = useAppTranslations();
  const { data: stats, isLoading: isStatsLoading } = useGetReferralStatsQuery();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const [claim, { isLoading: isClaiming }] = useClaimMutation();

  return (
    <div className="flex flex-col gap-3 p-5 bg-purple-gradient rounded-2xl text-center">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl">
          <div className="flex-center gap-2 text-gray-400">
            <Users className="min-w-3.5 w-3.5 aspect-square" />
            <div className="text-sm font-medium uppercase tracking-wider h-4.5 truncate">
              {t('invited')}
            </div>
          </div>
          <SkeletonSuspense
            loading={isStatsLoading}
            skeleton={<Skeleton textSize="lg" className="w-2/3" />}
          >
            <span className="text-xl font-semibold">{stats?.totalInvited}</span>
          </SkeletonSuspense>
        </div>
        <div className="flex flex-col items-center p-3 bg-white/5 rounded-2xl">
          <div className="flex-center gap-2 text-gray-400">
            <Wallet className="min-w-3.5 w-3.5 aspect-square" />
            <div className="text-sm font-medium uppercase tracking-wider h-4.5 truncate">
              {t('earned')}
            </div>
          </div>
          <SkeletonSuspense
            loading={isStatsLoading}
            skeleton={<Skeleton textSize="lg" className="w-2/3" />}
          >
            <span className="font-semibold">
              {stats?.totalEarned}{' '}
              <GoldenText className="font-bold">{GlobalConstants.coinName}</GoldenText>
            </span>
          </SkeletonSuspense>
        </div>
      </div>

      <div>
        <CopyButton
          variant="primary"
          loading={isMeLoading}
          value={getRefererLink(me?.id)}
          className="w-full flex-center gap-2 text-white rounded-xl font-semibold transition-colors text-sm h-12"
          icon={<Copy />}
        >
          {t('copy invite link')}
        </CopyButton>
        <Divider className="opacity-20 mt-4 mb-3" />
        <div className="flex items-center justify-between gap-2">
          <div className="text-left flex-1 overflow-hidden">
            <div className="w-full text-sm text-pink-secondary truncate">
              {t('available to claim')}
            </div>
            <div className="font-semibold text-white-secondary">
              {stats?.availableClaim}{' '}
              <GoldenText className="font-bold">{GlobalConstants.coinName}</GoldenText>
            </div>
          </div>
          <Button
            variant="primary"
            loading={isMeLoading || isClaiming}
            onClick={() => claim()}
            disabled={!stats?.availableClaim}
            iconSize={14}
            className="max-w-1/2 w-fit flex-center font-semibold transition-colors text-sm py-3 px-4 truncate overflow-hidden"
          >
            {t('claim reward')}
          </Button>
        </div>
      </div>
    </div>
  );
};
