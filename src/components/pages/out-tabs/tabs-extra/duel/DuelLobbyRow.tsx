'use client';

import { Button } from '@/components/shared/buttons/Button';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { duelClock } from '@/utils/global/duel.utils';
import type { DuelLobby } from '@/types/interfaces/duel.interfaces';

export interface DuelLobbyRowProps {
  lobby: DuelLobby;
  busy: boolean;
  onJoin: (id: string) => void;
}

/**
 * Одна строка списка: кто ждёт, сколько уже ждёт и во что обойдётся вход.
 *
 * Ожидание и ставка идут одной строкой под именем — так их читают за один
 * взгляд, вместе с решением «войти или нет».
 */
export function DuelLobbyRow({ lobby, busy, onJoin }: DuelLobbyRowProps) {
  const t = useAppTranslations();

  return (
    <div className="bg-background-overlay flex items-center gap-3 rounded-2xl border border-white/8 p-3">
      <DuelPlayerAvatar name={lobby.host.name} avatarUrl={lobby.host.avatarUrl || undefined} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold">{lobby.host.name}</span>
        <span className="text-disabled block text-[12px]">
          {t('duel waiting for', { time: duelClock(lobby.waitingSeconds) })} ·{' '}
          <span className="text-gold font-bold tabular-nums">{lobby.stake}</span>{' '}
          {t('duel stake tickets', { count: lobby.stake }).replace(/^\d+\s*/, '')}
        </span>
      </span>

      <Button className="h-10 px-5 text-[13px]" loading={busy} onClick={() => onJoin(lobby.id)}>
        {t('duel join')}
      </Button>
    </div>
  );
}
