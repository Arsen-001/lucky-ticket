'use client';

import { useEffect, useState } from 'react';
import { useGetDuelLobbiesQuery } from '@/api/duel.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { DuelLobbies } from './DuelLobbies';
import { DuelArena } from './DuelArena';

/**
 * Экран дуэли целиком.
 *
 * Пока фича на стадии «тестировщики», сюда не попадёт никто, кроме списка в
 * панели: гейт стоит и здесь, и на каждом эндпоинте — «его не видно» не
 * является проверкой прав.
 */
export function DuelScreen() {
  const t = useAppTranslations();
  const enabled = useFeature('duel');
  const [duelId, setDuelId] = useState<string | null>(null);
  // Лобби открыли кнопкой «играть с другом» — список друзей показываем сразу.
  const [inviteOnEnter, setInviteOnEnter] = useState(false);
  // Остаток билетов держит шапку игры на всех фазах. Запрос тот же, что у
  // списка лобби, поэтому лишнего похода на сервер нет — RTK отдаёт кеш.
  const { data: lobbies } = useGetDuelLobbiesQuery();

  // Матч, который игрок не закрыл, важнее списка: сервер всё равно не даст
  // создать второй, а сам матч продолжает идти по часам.
  const active = lobbies?.active;
  useEffect(() => {
    if (active && active.status !== 'WAITING') {
      setInviteOnEnter(false);
      setDuelId(active.id);
    }
  }, [active?.id, active?.status]);

  if (!enabled) {
    return (
      <p className="flex-available flex-center px-6 text-center text-sm text-disabled">
        {t('duel unavailable')}
      </p>
    );
  }

  return (
    // Ровно высота прокручиваемой области, а не «не меньше»: иначе нижняя
    // кнопка встаёт по концу контента и под ней остаётся пустое поле.
    <div className="flex h-full flex-col items-stretch pb-2">
      {duelId ? (
        <DuelArena
          duelId={duelId}
          tickets={lobbies?.tickets ?? 0}
          openInvite={inviteOnEnter}
          onLeave={() => {
            setDuelId(null);
            setInviteOnEnter(false);
          }}
        />
      ) : (
        <DuelLobbies
          onEnter={(id, options) => {
            setInviteOnEnter(Boolean(options?.invite));
            setDuelId(id);
          }}
        />
      )}
    </div>
  );
}
