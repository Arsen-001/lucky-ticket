'use client';

import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';
import { DuelStakeAmount } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakeAmount';
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
 * Одна строка списка: кто ждёт, во что обойдётся вход и кнопка входа.
 *
 * Слева — цена, справа — действие, как в любом списке, где во что-то входят за
 * деньги. Цена стоит первой строкой под именем и написана как деньги: число и
 * сразу за ним билет ([[DuelStakeAmount]]), без слова «ставка» — билет говорит
 * это картинкой на всех двадцати языках. Ожидание ушло следом приглушённым: это
 * справка, а не то, что решают.
 */
export function DuelLobbyRow({ lobby, busy, affordable = true, onJoin }: DuelLobbyRowProps) {
  const t = useAppTranslations();

  return (
    <div className="duel-rim flex items-center gap-3 rounded-[14px] p-3">
      <DuelPlayerAvatar name={lobby.host.name} avatarUrl={lobby.host.avatarUrl || undefined} />

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold">{lobby.host.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5">
          <DuelStakeAmount stake={lobby.stake} tier={lobby.tier} />
          <span className="text-disabled truncate text-[12px]">
            · {t('duel waiting for', { time: duelClock(lobby.waitingSeconds) })}
          </span>
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
