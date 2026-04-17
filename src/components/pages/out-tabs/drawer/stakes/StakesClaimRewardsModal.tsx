'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Ticket } from '@/components/shared/icons/Ticket';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import { Trophy, Zap, Clock, Coins } from 'lucide-react';
import { useMemo } from 'react';

interface StakesClaimRewardsModalProps {
  open: boolean;
  onClose: () => void;
  levelDef: StakeLevelDefinition;
}

type JackpotReward =
  | { type: 'ltc'; amount: number }
  | { type: 'speed_boost' }
  | { type: 'duration_boost' }
  | null;

const JACKPOT_PROBABILITY = 0.6;

function rollJackpot(prizes: string[]): JackpotReward {
  if (Math.random() > JACKPOT_PROBABILITY) return null;
  const roll = Math.random();
  if (prizes.some(p => p.toLowerCase().includes('ltc') || p.toLowerCase().includes('coin'))) {
    if (roll < 0.4) return { type: 'ltc', amount: Math.floor(Math.random() * 200 + 50) };
  }
  if (prizes.some(p => p.toLowerCase().includes('speed'))) {
    if (roll < 0.7) return { type: 'speed_boost' };
  }
  return { type: 'duration_boost' };
}

export function StakesClaimRewardsModal({ open, onClose, levelDef }: StakesClaimRewardsModalProps) {
  const t = useAppTranslations();

  const jackpot = useMemo<JackpotReward>(
    () => (open ? rollJackpot(levelDef.bonusPrizes) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open]
  );

  return (
    <Modal open={open} onClose={onClose} hideCloseButton>
      <div className="bg-purple-gradient p-6 rounded-2xl flex flex-col gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex-center w-14 h-14 rounded-full bg-pink-gradient mb-1">
            <Trophy size={28} />
          </div>
          <h3 className="text-xl font-bold">{t('stake complete')}</h3>
          <p className="text-sm text-gray-400">{t('stake complete description')}</p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{t('guaranteed rewards')}</p>
          <div className="flex items-center justify-center gap-4">
            {levelDef.allTickets.map(ticketType => (
              <div key={ticketType} className="flex flex-col items-center gap-1.5">
                <Ticket type={ticketType} width={44} height={44} />
                <span className="text-[11px] capitalize text-gray-300">{t(ticketType as any)}</span>
              </div>
            ))}
          </div>
        </div>

        {jackpot && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide">{t('jackpot prize')}</p>
            <div className="flex-center gap-3 bg-background-overlay rounded-xl py-4 px-5">
              {jackpot.type === 'ltc' && (
                <>
                  <Coins size={22} className="text-yellow-400 shrink-0" />
                  <span className="font-bold text-lg">
                    +{jackpot.amount}{' '}
                    <GoldenText className="font-bold text-sm">
                      {GlobalConstants.coinName}
                    </GoldenText>
                  </span>
                </>
              )}
              {jackpot.type === 'speed_boost' && (
                <>
                  <Zap size={22} className="text-pink-400 shrink-0" />
                  <span className="font-bold">{t('claim speed boost')}</span>
                </>
              )}
              {jackpot.type === 'duration_boost' && (
                <>
                  <Clock size={22} className="text-teal-400 shrink-0" />
                  <span className="font-bold">{t('claim duration boost')}</span>
                </>
              )}
            </div>
          </div>
        )}

        {!jackpot && <p className="text-xs text-gray-500 italic">{t('no jackpot this time')}</p>}

        <Button variant="primary" onClick={onClose} className="w-full">
          {t('awesome')}
        </Button>
      </div>
    </Modal>
  );
}
