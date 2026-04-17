'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import { useStartStakeMutation } from '@/api/stakes.api';
import { useGetMeQuery } from '@/api/me.api';
import { GlobalConstants } from '@/constants/global.constants';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Ticket } from '@/components/shared/icons/Ticket';
import { Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface StakesStartModalProps {
  open: boolean;
  onClose: () => void;
  levelDef: StakeLevelDefinition | null;
}

export function StakesStartModal({ open, onClose, levelDef }: StakesStartModalProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const [startStake, { isLoading }] = useStartStakeMutation();
  const [amount, setAmount] = useState('');

  if (!levelDef) return null;

  const numAmount = Number(amount);
  const balance = me?.coins ?? 0;
  const insufficient = numAmount > balance;
  const belowMin = numAmount < levelDef.minDeposit;
  const invalid = !numAmount || insufficient || belowMin;

  const handleConfirm = async () => {
    if (invalid) return;
    await startStake({ level: levelDef.level, amount: numAmount });
    setAmount('');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="bg-purple-gradient p-6 rounded-2xl flex flex-col gap-5">
        <div className="text-center">
          <h3 className="text-xl font-bold">
            {t('start stake')} — {t('level {level}', { level: levelDef.level })}
          </h3>
          <div className="flex items-center justify-center gap-1.5 text-gray-400 text-sm mt-1">
            <Clock size={14} />
            <span>{t('stake duration description')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">{t('guaranteed rewards')}</p>
          <div className="flex items-center gap-3">
            {levelDef.allTickets.map(ticketType => (
              <Ticket key={ticketType} type={ticketType} width={36} height={36} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <label className="text-gray-400">{t('stake amount')}</label>
            <span className="text-gray-400">
              {t('balance')}: {balance}{' '}
              <GoldenText className="text-xs font-bold">{GlobalConstants.coinName}</GoldenText>
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={`${t('min deposit')} ${levelDef.minDeposit}`}
              className="w-full bg-background-overlay rounded-xl py-3 px-4 text-white placeholder-gray-500 outline-none text-sm"
              min={levelDef.minDeposit}
              max={balance}
            />
            <button
              onClick={() => setAmount(String(balance))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-pink-400 font-semibold"
            >
              {t('max')}
            </button>
          </div>
          {insufficient && (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle size={12} />
              <span>{t('insufficient balance')}</span>
            </div>
          )}
          {belowMin && !insufficient && numAmount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-orange-400">
              <AlertCircle size={12} />
              <span>
                {t('min deposit')}: {levelDef.minDeposit} {GlobalConstants.coinName}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1 py-2 rounded-full"
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={invalid}
            loading={isLoading}
            className="flex-1 py-2 rounded-full"
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
