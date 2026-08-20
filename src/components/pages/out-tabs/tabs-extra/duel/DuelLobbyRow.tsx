'use client';

import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';
import { Button } from '@/components/shared/buttons/Button';
import { DuelStakeBadge } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakeBadge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { DuelLobby } from '@/types/interfaces/duel.interfaces';

export interface DuelLobbyRowProps {
  lobby: DuelLobby;
  busy: boolean;
  onJoin: (id: string) => void;
}

/**
 * Одна строка списка: кто ждёт, сколько уже ждёт и во что обойдётся вход.
 *
 * Ставка стоит рядом с кнопкой намеренно — цена читается в том же взгляде,
 * которым выбирают «войти», а не после нажатия.
 */
export function DuelLobbyRow({ lobby, busy, onJoin }: DuelLobbyRowProps) {
  const t = useAppTranslations();

  return (
    <div className="bg-background-overlay flex items-center gap-3 rounded-2xl border border-white/8 p-3">
      <DuelPlayerAvatar name={lobby.host.name} avatarUrl={lobby.host.avatarUrl || undefined} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold">{lobby.host.name}</span>
        <span className="text-disabled block text-[11px] tabular-nums">
          {t('duel waiting seconds', { count: lobby.waitingSeconds })}
        </span>
      </span>

      <DuelStakeBadge stake={lobby.stake} />

      <Button className="h-9 px-4 text-xs" loading={busy} onClick={() => onJoin(lobby.id)}>
        {t('duel join')}
      </Button>
    </div>
  );
}
