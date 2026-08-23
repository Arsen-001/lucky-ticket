'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { DuelInviteModal } from '@/components/pages/out-tabs/tabs-extra/duel/DuelInviteModal';
import { DuelWriteAccessRow } from '@/components/pages/out-tabs/tabs-extra/duel/DuelWriteAccessRow';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { duelClock } from '@/utils/global/duel.utils';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';

export interface DuelWaitingProps {
  /** Лобби, в которое зовут. */
  duelId: string;
  /** Кого ждём поимённо: пока вызов жив, лобби закрыто для остальных. */
  invitedName?: string | null;
  /** Открыть список друзей сразу — лобби создавали именно ради них. */
  openInvite?: boolean;
  stake: number;
  /** Лига стола: её имя стоит в тексте — стол видит она, а не «бронза» всегда. */
  tier?: DuelTier;
  seconds: number;
  onCancel: () => void;
  /** Отмена ушла на сервер — кнопка крутит лоадер, пока ответ не пришёл. */
  cancelling?: boolean;
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
  invitedName,
  openInvite,
  stake,
  tier = 'bronze',
  seconds,
  onCancel,
  cancelling = false,
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
          <span className="flex-center duel-rim h-[76px] w-[76px] rounded-full text-[28px]">
            ⚔️
          </span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-[17px] font-extrabold">
            {invitedName
              ? t('duel waiting for player', { name: invitedName })
              : t('duel waiting title')}
          </span>
          {/* Лига стола названа жетоном: ждать бронзу и ждать золото — разное
              ожидание, и очередь у них своя. Существительным, а не
              прилагательным: «бронзовый стол» требует согласования в каждом из
              двадцати языков, а «Бронза · ставка 2» — нет. */}
          <span className="duel-chip flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-black tracking-[0.14em] text-white/90 uppercase">
            <Ticket
              type={tier}
              width={20}
              height={20}
              className="h-[13px] w-[20px] object-contain"
            />
            {t(tier)} · {t('duel stake short')}{' '}
            <b className="text-gold text-[12px] tabular-nums">{stake}</b>
          </span>

          <p className="text-pink-secondary max-w-[28ch] text-[13px] leading-snug">
            {invitedName
              ? t('duel waiting private', { count: stake })
              : t('duel waiting blurb', { count: stake })}
          </p>
          <span className="text-gold text-[22px] font-extrabold tabular-nums">
            {duelClock(seconds)}
          </span>
        </div>
      </div>

      {/* Позвать конкретного человека — единственный способ вернуть в игру
          того, кто сейчас не в ней. Ждать случайного соперника можно и дальше:
          приглашение не отменяет ожидания. */}
      <div className="flex flex-col gap-2">
        {/* Просьба стоит здесь, а не в настройках: игрок как раз ждёт
            соперника, и разрешение — это то, что позволит позвать его в
            следующий раз. */}
        <DuelWriteAccessRow />

        <Button className="h-13 w-full" onClick={() => setInviting(true)}>
          {t('duel invite players')}
        </Button>
        <Button
          variant="transparent"
          className="h-12 w-full"
          loading={cancelling}
          onClick={onCancel}
        >
          {t('duel cancel waiting')}
        </Button>
      </div>

      <DuelInviteModal
        open={inviting}
        duelId={duelId}
        stake={stake}
        tier={tier}
        onClose={() => setInviting(false)}
      />
    </div>
  );
}
