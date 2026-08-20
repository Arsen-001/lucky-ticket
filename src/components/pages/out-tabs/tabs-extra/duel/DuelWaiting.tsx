'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { DuelInviteModal } from '@/components/pages/out-tabs/tabs-extra/duel/DuelInviteModal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { duelClock } from '@/utils/global/duel.utils';

export interface DuelWaitingProps {
  /** Лобби, в которое зовут. */
  duelId: string;
  /** Открыть список друзей сразу — лобби создавали именно ради них. */
  openInvite?: boolean;
  stake: number;
  seconds: number;
  onCancel: () => void;
  className?: string;
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
export function DuelWaiting({
  duelId,
  openInvite,
  stake,
  seconds,
  onCancel,
  className,
}: DuelWaitingProps) {
  const t = useAppTranslations();
  const [inviting, setInviting] = useState(Boolean(openInvite));

  return (
    <div className={twMerge('flex h-full flex-col text-center', className)}>
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
          <p className="text-pink-secondary max-w-[28ch] text-[13px] leading-snug">
            {t('duel waiting blurb', { count: stake })}
          </p>
          <span className="text-gold text-[15px] font-extrabold tabular-nums">
            {duelClock(seconds)}
          </span>
        </div>
      </div>

      {/* Позвать конкретного человека — единственный способ вернуть в игру
          того, кто сейчас не в ней. Ждать случайного соперника можно и дальше:
          приглашение не отменяет ожидания. */}
      <div className="flex flex-col gap-2">
        <Button className="h-13 w-full" onClick={() => setInviting(true)}>
          {t('duel invite players')}
        </Button>
        <Button variant="transparent" className="h-12 w-full" onClick={onCancel}>
          {t('duel cancel waiting')}
        </Button>
      </div>

      <DuelInviteModal open={inviting} duelId={duelId} onClose={() => setInviting(false)} />
    </div>
  );
}
