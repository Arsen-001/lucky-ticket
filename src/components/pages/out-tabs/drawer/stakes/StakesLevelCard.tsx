'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import { Ticket } from '@/components/shared/icons/Ticket';
import { GlobalConstants } from '@/constants/global.constants';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Button } from '@/components/shared/buttons/Button';
import { Gift, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const tierColorMap: Record<string, string> = {
  bronze: 'text-[var(--color-bronze)]',
  silver: 'text-[var(--color-silver)]',
  gold: 'text-[var(--color-gold)]',
  platinum: 'text-[var(--color-platinum)]',
  diamond: 'text-[var(--color-diamond)]',
};

interface StakesLevelCardProps {
  levelDef: StakeLevelDefinition;
  hasActiveStake: boolean;
  onStart: (levelDef: StakeLevelDefinition) => void;
}

export function StakesLevelCard({ levelDef, hasActiveStake, onStart }: StakesLevelCardProps) {
  const t = useAppTranslations();

  return (
    <div className="card-outlined flex flex-col gap-4 p-4 rounded-2xl">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{t('level {level}', { level: levelDef.level })}</span>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-400">{t('min deposit')}</span>
          <span className="font-bold">
            {levelDef.minDeposit}{' '}
            <GoldenText className="text-xs font-bold">{GlobalConstants.coinName}</GoldenText>
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Gift size={13} />
          <span>{t('guaranteed rewards')}</span>
        </div>
        <div className="flex items-center gap-2">
          {levelDef.allTickets.map(ticketType => (
            <div key={ticketType} className="flex flex-col items-center gap-1">
              <Ticket type={ticketType} width={32} height={32} />
              <span
                className={twMerge(
                  'text-[10px] font-semibold capitalize',
                  tierColorMap[ticketType]
                )}
              >
                {t(ticketType as any)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Sparkles size={13} />
          <span>{t('jackpot prize chance')}</span>
        </div>
        <div className="flex flex-col gap-1">
          {levelDef.bonusPrizes.map(prize => (
            <div key={prize} className="flex items-center gap-1.5 text-xs">
              <span className="w-1 h-1 rounded-full bg-pink-400 shrink-0" />
              <span className="text-gray-300">{prize}</span>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="primary"
        disabled={hasActiveStake}
        onClick={() => onStart(levelDef)}
        className="w-full py-2.5 text-sm"
      >
        {hasActiveStake ? t('stake in progress') : t('start stake')}
      </Button>
    </div>
  );
}
