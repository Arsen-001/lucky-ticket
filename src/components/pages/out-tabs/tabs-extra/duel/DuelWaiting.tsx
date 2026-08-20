'use client';

import { Button } from '@/components/shared/buttons/Button';
import { DuelStakeBadge } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakeBadge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface DuelWaitingProps {
  stake: number;
  seconds: number;
  onCancel: () => void;
}

/**
 * Своё лобби, к которому ещё никто не пришёл.
 *
 * Пульсирующее кольцо, а не спиннер: спиннер читается как «приложение
 * зависло», и человек начинает жать назад. Кольцо говорит «идёт поиск», а
 * счётчик — что процесс живой.
 *
 * Билеты в этот момент НЕ списаны, и об этом сказано прямо: отменить ожидание
 * должно быть не страшно.
 */
export function DuelWaiting({ stake, seconds, onCancel }: DuelWaitingProps) {
  const t = useAppTranslations();

  return (
    <div className="flex min-h-full flex-col text-center">
      {/* Поиск — по центру экрана, отмена — под большим пальцем: одно
          «justify-center» на весь блок держало кнопку посередине. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="duel-pulse flex-center relative h-[118px] w-[118px] rounded-full">
          <span className="flex-center bg-background-overlay h-[76px] w-[76px] rounded-full border border-white/10 text-[28px]">
            ⚔️
          </span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-[17px] font-extrabold">{t('duel waiting title')}</span>
          <p className="text-pink-secondary max-w-[26ch] text-[13px] leading-snug">
            {t('duel waiting note')}
          </p>
          <span className="text-gold text-[15px] font-extrabold tabular-nums">
            {t('duel waiting seconds', { count: seconds })}
          </span>
        </div>

        <DuelStakeBadge stake={stake} />
      </div>

      <Button variant="transparent" className="h-12 w-full" onClick={onCancel}>
        {t('duel cancel waiting')}
      </Button>
    </div>
  );
}
