'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useClaimStakeMutation, useCancelStakeMutation } from '@/api/stakes.api';
import type { ActiveStake, StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import { StakeStatus } from '@/types/enums/stakes.enums';
import { Progress } from '@/components/shared/Progress';
import { Button } from '@/components/shared/buttons/Button';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { StakesClaimRewardsModal } from '@/components/pages/out-tabs/drawer/stakes/StakesClaimRewardsModal';
import { GlobalConstants } from '@/constants/global.constants';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Lock, Trophy } from 'lucide-react';
import { useState } from 'react';

interface StakesActiveSessionProps {
  stake: ActiveStake;
  levelDef: StakeLevelDefinition;
}

const STAKE_DURATION = { hours: 3, minutes: 0, seconds: 0 };

export function StakesActiveSession({ stake, levelDef }: StakesActiveSessionProps) {
  const t = useAppTranslations();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [rewardsOpen, setRewardsOpen] = useState(false);
  const countdown = useCountDown(stake.endDate);
  const [cancelStake, { isLoading: isCancelling }] = useCancelStakeMutation();
  const [claimStake, { isLoading: isClaiming }] = useClaimStakeMutation();

  const isCompleted = stake.status === StakeStatus.COMPLETED || countdown.expired;
  const percentage = countdown.getPassedPercentage(STAKE_DURATION);

  const handleClaim = async () => {
    await claimStake();
    setRewardsOpen(true);
  };

  const handleCancel = () => cancelStake().then(() => setCancelOpen(false));

  return (
    <div className="flex flex-col gap-4 p-5 bg-purple-gradient rounded-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-pink-400" />
          <span className="text-sm text-gray-400">{t('active stake')}</span>
        </div>
        <span className="text-xs bg-pink-gradient px-2.5 py-0.5 rounded-full font-semibold">
          {t('level {level}', { level: stake.level })}
        </span>
      </div>

      <div className="flex items-center justify-between bg-background-overlay rounded-xl py-3 px-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <Lock size={14} />
          <span>{t('locked')}</span>
        </div>
        <span className="font-bold">
          {stake.lockedAmount}{' '}
          <GoldenText className="text-xs font-bold">{GlobalConstants.coinName}</GoldenText>
        </span>
      </div>

      {!isCompleted && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{t('time remaining')}</span>
            <span className="font-mono font-semibold text-white">{countdown.leftTime}</span>
          </div>
          <Progress percentage={percentage} />
        </div>
      )}

      {isCompleted ? (
        <Button
          variant="primary"
          onClick={handleClaim}
          loading={isClaiming}
          className="w-full flex items-center justify-center gap-2"
        >
          <Trophy size={16} />
          {t('claim reward')}
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setCancelOpen(true)}
          className="w-full text-sm py-2"
        >
          {t('cancel stake')}
        </Button>
      )}

      <ConfirmModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={isCancelling}
        title={t('cancel stake')}
        content={
          <p className="text-sm text-gray-400 text-center">{t('cancel stake description')}</p>
        }
        confirmText={t('cancel stake')}
        cancelText={t('keep staking')}
      />

      <StakesClaimRewardsModal
        open={rewardsOpen}
        onClose={() => setRewardsOpen(false)}
        levelDef={levelDef}
      />
    </div>
  );
}
