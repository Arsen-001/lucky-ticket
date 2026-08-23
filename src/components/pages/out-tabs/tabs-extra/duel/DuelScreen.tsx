'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetDuelLobbiesQuery, useJoinDuelMutation } from '@/api/duel.api';
import { useToast } from '@/hooks/useToast';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { routes } from '@/constants/routes';
import { duelJoinFailure } from '@/utils/global/duel.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useFeature } from '@/hooks/useFeature';
import { useTelegramSurfaceColor } from '@/hooks/useTelegramSurfaceColor';
import { DuelLobbies } from './DuelLobbies';
import { DuelArena } from './DuelArena';
import '@/styles/components/duel.css';

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
  // Верхняя полоса телеграма красится в цвет стола, а не основного фона: над
  // почти чёрной игрой висела светлая полоса приложения, и шов был виден
  // раньше самой игры. Уходим с экрана — цвет возвращается.
  useTelegramSurfaceColor('#0b0914');
  const [duelId, setDuelId] = useState<string | null>(null);
  // Лобби открыли кнопкой «играть с другом» — список друзей показываем сразу.
  const [inviteOnEnter, setInviteOnEnter] = useState(false);
  // Остаток билетов держит шапку игры на всех фазах. Запрос тот же, что у
  // списка лобби, поэтому лишнего похода на сервер нет — RTK отдаёт кеш.
  const { data: lobbies } = useGetDuelLobbiesQuery();
  const [join] = useJoinDuelMutation();
  const toast = useToast();
  const spend = useSpendFailure();

  /**
   * Заход по приглашению: `?lobby=<id>` из ссылки бота.
   *
   * Человек нажал «принять вызов» — значит идёт играть, а не выбирать из
   * списка. Поэтому вход делается сам, без единой модалки по дороге. Не
   * получилось (лобби заняли или закрыли, пока он шёл) — так и говорим, и
   * оставляем его в списке, где можно выбрать другое.
   */
  const router = useRouter();
  const params = useSearchParams();
  const invitedLobbyId = params.get('lobby');
  // Пришли из карточки игрока: экран открывается сразу выбором ставки, а
  // «Старт» создаёт лобби и тут же зовёт именно его.
  const inviteUserId = params.get('invite');
  const joinedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!enabled || !invitedLobbyId || joinedRef.current === invitedLobbyId) return;
    joinedRef.current = invitedLobbyId;
    void (async () => {
      try {
        const duel = await join(invitedLobbyId).unwrap();
        setDuelId(duel.id);
        // Адрес отработал: иначе перезагрузка или возврат к списку снова
        // пытались бы войти в лобби, которого уже нет.
        router.replace(routes.games.duel);
      } catch (error) {
        const reason = duelJoinFailure(error);
        if (reason === 'tickets') {
          await spend.report(error);
          return;
        }
        toast.error(
          reason === 'closed'
            ? t('duel lobby closed')
            : reason === 'left'
              ? t('duel lobby left')
              : t('duel invite gone')
        );
      }
    })();
  }, [enabled, invitedLobbyId]);

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
    <div className="duel-lamp flex h-full flex-col items-stretch pb-2">
      {spend.modals}
      {duelId ? (
        <DuelArena
          duelId={duelId}
          tickets={lobbies?.tickets ?? 0}
          readySeconds={lobbies?.readySeconds}
          balances={lobbies?.balances}
          openInvite={inviteOnEnter}
          onLeave={() => {
            setDuelId(null);
            setInviteOnEnter(false);
          }}
          onRematch={id => {
            setInviteOnEnter(false);
            setDuelId(id);
          }}
        />
      ) : (
        <DuelLobbies
          inviteUserId={inviteUserId}
          onEnter={(id, options) => {
            setInviteOnEnter(Boolean(options?.invite));
            setDuelId(id);
            // Адрес отработал — убираем параметры, иначе возврат к списку
            // снова открыл бы выбор ставки, а вход по ссылке — повторный join.
            if (inviteUserId || invitedLobbyId) router.replace(routes.games.duel);
          }}
        />
      )}
    </div>
  );
}
