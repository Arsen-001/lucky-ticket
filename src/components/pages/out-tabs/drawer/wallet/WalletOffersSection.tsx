'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetMeQuery } from '@/api/me.api';
import { GlobalConstants } from '@/constants/global.constants';
import { BadgeCent, Pencil, Wallet } from 'lucide-react';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useState } from 'react';
import { ConnectWalletModal } from './ConnectWalletModal';
import { Button } from '@/components/shared/buttons/Button';

export const WalletOffersSection = () => {
  const t = useAppTranslations();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatWalletId = (walletId: string) => {
    if (!walletId) return '';
    return `${walletId.slice(0, 4)}****`;
  };

  return (
    <div className="flex flex-col p-5 bg-purple-gradient rounded-2xl gap-4">
      <div className="flex flex-col gap-3">
        <div className="bg-background-overlay rounded-xl flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <BadgeCent size={16} /> <span className="h-4.5">{t('balance')} :</span>
          </div>
          <SkeletonSuspense
            loading={isMeLoading}
            skeleton={<Skeleton textSize="base" className="w-16" />}
          >
            <div className="h-5 font-semibold">
              {me?.coins}{' '}
              <GoldenText className="h-full font-bold text-xs">
                {GlobalConstants.coinName}
              </GoldenText>
            </div>
          </SkeletonSuspense>
        </div>

        <SkeletonSuspense
          loading={isMeLoading}
          skeleton={<Skeleton className="w-full h-11 rounded-xl" />}
        >
          {me?.walletId ? (
            <div className="flex items-center gap-2">
              <div className="flex-available bg-background-overlay rounded-xl flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Wallet size={16} /> <span className="h-4.5">{t('wallet id')} :</span>
                </div>
                <div className="h-5 font-semibold">{formatWalletId(me.walletId)}</div>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="p-2.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Pencil size={16} />
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              className="w-full py-2.5 rounded-xl border-white/20 hover:bg-white/5"
              onClick={() => setIsModalOpen(true)}
            >
              {t('connect wallet')}
            </Button>
          )}
        </SkeletonSuspense>
      </div>

      <ConnectWalletModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
