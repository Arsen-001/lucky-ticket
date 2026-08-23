'use client';

import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { duelClock } from '@/utils/global/duel.utils';
import type { DuelLobby } from '@/types/interfaces/duel.interfaces';

export interface DuelLobbyRowProps {
  lobby: DuelLobby;
  busy: boolean;
  /** Хватает ли моих билетов на эту ставку. Нет — кнопка тусклая, но тап остаётся: он откроет окно нехватки. */
  affordable?: boolean;
  onJoin: (id: string) => void;
}

/**
 * Одна строка списка: кто ждёт, сколько уже ждёт и во что обойдётся вход.
 *
 * Ожидание и ставка идут одной строкой под именем — так их читают за один
 * взгляд, вместе с решением «войти или нет».
 */
export function DuelLobbyRow({ lobby, busy, affordable = true, onJoin }: DuelLobbyRowProps) {
  const t = useAppTranslations();

  return (
    <div className="duel-rim flex items-center gap-3 rounded-[14px] p-3">
      <DuelPlayerAvatar name={lobby.host.name} avatarUrl={lobby.host.avatarUrl || undefined} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold">{lobby.host.name}</span>
        <span className="text-disabled block text-[12px]">
          {t('duel waiting for', { time: duelClock(lobby.waitingSeconds) })} ·{' '}
          {t('duel stake short')}{' '}
          <span className="text-gold font-bold tabular-nums">{lobby.stake}</span>{' '}
          {/* Билет лиги вместо слова: во что играют, видно раньше, чем прочитано */}
          <Ticket
            type={lobby.tier}
            width={22}
            height={22}
            className="inline-block h-[14px] w-[22px] object-contain align-[-2px]"
          />
        </span>
      </span>

      <Button
        className={twMerge(
          'h-10 shrink-0 rounded-xl px-5 text-[13px]',
          !affordable && 'opacity-45'
        )}
        loading={busy}
        onClick={() => onJoin(lobby.id)}
      >
        {t('duel join')}
      </Button>
    </div>
  );
}
