'use client';

import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { DuelGameHeader } from '@/components/pages/out-tabs/tabs-extra/duel/DuelGameHeader';
import { DuelInviteModal } from '@/components/pages/out-tabs/tabs-extra/duel/DuelInviteModal';
import { DuelLobbyRow } from '@/components/pages/out-tabs/tabs-extra/duel/DuelLobbyRow';
import { duelClock, duelJoinFailure, duelMatchInProgress } from '@/utils/global/duel.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useInFlightLock } from '@/hooks/useInFlightLock';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { useToast } from '@/hooks/useToast';
import {
  useCancelDuelMutation,
  useCreateDuelMutation,
  useGetDuelLobbiesQuery,
  useInviteToDuelMutation,
  useJoinDuelMutation,
} from '@/api/duel.api';

export interface DuelLobbiesProps {
  /** `invite` — открыть лобби и сразу показать список друзей. */
  onEnter: (duelId: string, options?: { invite?: boolean }) => void;
  /**
   * Кого зовём: пришли из карточки игрока.
   *
   * Экран сразу открывается выбором ставки — позвать без ставки нельзя, она
   * часть вызова, а не настройка после него.
   */
  inviteUserId?: string | null;
}

/**
 * Список лобби и создание своего.
 *
 * Экран открывается сразу этим: играть можно с первого касания, без единого
 * перехода — поэтому «Создать лобби» лежит внизу, в зоне большого пальца, а не
 * прячется за плюсом в шапке.
 */
export function DuelLobbies({ onEnter, inviteUserId }: DuelLobbiesProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const [picking, setPicking] = useState(Boolean(inviteUserId));
  const [stake, setStake] = useState(1);
  // Какая из двух кнопок создания нажата — лоадер крутит она одна, вторая
  // просто гаснет. Обе под одним замком `create`, чтобы второй тап не ушёл.
  const [creating, setCreating] = useState<'open' | 'friend' | null>(null);
  // «Играть с другом»: сначала выбор, кого позвать, — лобби создаётся вместе с
  // вызовом. Созданное здесь лобби запоминается, чтобы войти в него, когда
  // модалка закроется (она закрывается сама после отправки).
  const [pickingFriends, setPickingFriends] = useState(false);
  // Ref, а не state: модалка зовёт `onClose` из того же вызова, в котором
  // лобби только что создалось, — state в этом замыкании ещё пустой.
  const createdForFriends = useRef<string | null>(null);
  // Замок вместо `isLoading`: RTK батчит `pending`, и перерисовка, гасящая
  // кнопку, может опоздать на кадр — два быстрых тапа успевают уйти оба.
  // Игрок и ДОЛЖЕН жать быстро, просить его «не спешить» нельзя.
  const lock = useInFlightLock();
  // Нехватка билетов — модалка с дорогой к билетам, не тост (правило для
  // всех экранов, где что-то стоит денег).
  const spend = useSpendFailure();

  const { data, isLoading, isError, refetch } = useGetDuelLobbiesQuery(undefined, {
    pollingInterval: 3000,
  });
  const [create] = useCreateDuelMutation();
  const [join] = useJoinDuelMutation();
  const [cancel] = useCancelDuelMutation();
  const [inviteToDuel] = useInviteToDuelMutation();

  const tickets = data?.tickets ?? 0;
  const min = data?.stakeMin ?? 1;
  const max = data?.stakeMax ?? 5;

  const handleCreate = async () => {
    if (!lock.acquire('create')) return;
    setCreating('open');
    try {
      const duel = await create({ stake }).unwrap();
      // Зовём того, ради кого пришли: лобби уже есть, ставка выбрана — вызов
      // уходит тем же движением, без второго экрана.
      if (inviteUserId) {
        try {
          const result = await inviteToDuel({
            id: duel.id,
            userIds: [inviteUserId],
          }).unwrap();
          // Три разных исхода — три разных слова. «Не получилось» одинаковым
          // текстом на всё сразу не даёт понять, что делать дальше.
          if (result.invited > 0) toast.success(t('duel invite sent', { count: result.invited }));
          else if (result.unaffordable > 0) toast.error(t('duel invite unaffordable'));
          else if (result.unavailable > 0) toast.error(t('duel invite unavailable'));
          else toast.error(t('duel invite refused'));
        } catch {
          toast.error(t('duel invite refused'));
        }
      }
      setPicking(false);
      onEnter(duel.id);
    } catch (error) {
      // Идёт матч — не ошибка, а место, куда нужно вернуться: список лобби
      // прислал его в `active`, и экран откроет его следующим тиком.
      if (duelMatchInProgress(error)) {
        toast.info(t('duel match in progress'));
        if (data?.active) onEnter(data.active.id);
      } else {
        toast.error(t('duel action failed'));
      }
    } finally {
      setCreating(null);
      lock.release('create');
    }
  };

  const handleJoin = async (id: string) => {
    // Ставка выше моих билетов — сервер откажет; говорим это сразу и тем же
    // окном, каким сказал бы по его отказу.
    const target = data?.lobbies.find(l => l.id === id);
    if (target && target.stake > tickets) {
      spend.show('tickets', { required: target.stake });
      return;
    }
    // Ключ — id лобби: два тапа по РАЗНЫМ лобби это два разных действия, а два
    // тапа по одному — одно.
    if (!lock.acquire(id)) return;
    try {
      const duel = await join(id).unwrap();
      onEnter(duel.id);
    } catch (error) {
      // Свой матч ещё идёт — не ошибка, а место, куда нужно вернуться.
      if (duelMatchInProgress(error)) {
        toast.info(t('duel match in progress'));
        if (data?.active) onEnter(data.active.id);
        return;
      }
      const reason = duelJoinFailure(error);
      if (reason === 'tickets') {
        await spend.report(error, { required: target?.stake });
        return;
      }
      toast.error(
        reason === 'closed'
          ? t('duel lobby closed')
          : reason === 'reserved'
            ? t('duel lobby reserved')
            : reason === 'taken'
              ? t('duel invite gone')
              : reason === 'left'
                ? t('duel lobby left')
                : t('duel action failed')
      );
    } finally {
      lock.release(id);
    }
  };

  // Пока этого не было, отказ сервера выглядел как «у вас нет билетов»: без
  // данных `tickets` равен нулю, и кнопка «Создать лобби» просто гасла.
  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const header = <DuelGameHeader tickets={tickets} />;

  if (picking) {
    return (
      <div className="flex h-full flex-col gap-3">
        {header}

        <span className="text-pink-secondary text-[10px] font-black tracking-[0.16em] uppercase">
          {t('duel choose stake')}
        </span>

        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(value => (
            <button
              key={value}
              type="button"
              aria-pressed={stake === value}
              disabled={value > tickets}
              onClick={() => setStake(value)}
              className={twMerge(
                'flex h-16 flex-col items-center justify-center gap-0.5 rounded-2xl border transition',
                'bg-background-overlay border-white/10 disabled:opacity-30',
                stake === value && 'border-gold bg-gold/12'
              )}
            >
              <span
                className={twMerge(
                  'text-lg font-extrabold tabular-nums',
                  stake === value && 'text-gold'
                )}
              >
                {value}
              </span>
              <span className="text-pink-secondary text-[9px] tracking-wider uppercase">
                {t('duel tickets left')}
              </span>
            </button>
          ))}
        </div>

        <p className="text-disabled text-xs leading-relaxed">{t('duel stake note')}</p>

        <div className="mt-auto flex flex-col gap-2">
          <Button
            className="h-14"
            loading={creating === 'open'}
            disabled={creating !== null}
            onClick={() => handleCreate()}
          >
            {inviteUserId ? t('duel invite start') : t('duel open lobby')}
          </Button>
          {/* Тот же самый ход, но с ответом на «а с кем играть»: сперва
              выбираешь, кого позвать, и лобби открывается вместе с вызовом —
              уже приватным. Ждать случайного соперника после этого никто не
              мешает — приглашение ожидания не отменяет. */}
          {!inviteUserId && (
            <Button
              variant="secondary"
              className="h-13"
              loading={creating === 'friend'}
              disabled={creating !== null}
              onClick={() => setPickingFriends(true)}
            >
              {t('duel play with friend')}
            </Button>
          )}
          <Button variant="transparent" className="h-12" onClick={() => setPicking(false)}>
            {t('duel back')}
          </Button>
        </div>

        {spend.modals}
        <DuelInviteModal
          open={pickingFriends}
          stake={stake}
          onSend={async userIds => {
            if (!lock.acquire('create')) throw new Error('busy');
            setCreating('friend');
            try {
              const duel = await create({ stake }).unwrap();
              createdForFriends.current = duel.id;
              return await inviteToDuel({ id: duel.id, userIds }).unwrap();
            } finally {
              setCreating(null);
              lock.release('create');
            }
          }}
          onClose={() => {
            setPickingFriends(false);
            // Лобби есть — значит вызов ушёл: идём ждать именно этого человека.
            const id = createdForFriends.current;
            if (id) {
              createdForFriends.current = null;
              setPicking(false);
              onEnter(id);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {header}

      <div className="text-disabled flex items-baseline justify-between text-[10.5px] font-black tracking-[0.16em] uppercase">
        <span>{t('duel open lobbies')}</span>
        <span>{t('duel stake column')}</span>
      </div>

      {data?.own && (
        <button
          type="button"
          onClick={() => onEnter(data.own!.id)}
          className="border-gold/45 from-gold/10 flex items-center gap-3 rounded-2xl border bg-gradient-to-b to-transparent p-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">{t('duel your lobby')}</span>
            <span className="text-disabled block text-[12px]">
              {t('duel waiting for', { time: duelClock(data.own.waitingSeconds) })} ·{' '}
              <span className="text-gold font-bold tabular-nums">{data.own.stake}</span>{' '}
              {t('duel stake tickets', { count: data.own.stake }).replace(/^\d+\s*/, '')}
            </span>
          </span>
        </button>
      )}

      {!isLoading && !data?.lobbies.length && !data?.own && (
        <p className="text-disabled px-6 py-7 text-center text-[13px] leading-relaxed">
          {t('duel no lobbies')}
        </p>
      )}

      <div className="scrollbar-hidden flex flex-1 flex-col gap-2.5 overflow-y-auto">
        {data?.lobbies.map(lobby => (
          <DuelLobbyRow
            key={lobby.id}
            lobby={lobby}
            busy={lock.locked.has(lobby.id)}
            affordable={lobby.stake <= tickets}
            onJoin={handleJoin}
          />
        ))}
      </div>
      {spend.modals}

      <div className="flex flex-col gap-2 pt-1">
        {!data?.own && (
          <p className="text-pink-secondary px-1 text-[11px] leading-snug">
            {t('duel lobby hint')}
          </p>
        )}
        {data?.own ? (
          <Button
            variant="transparent"
            className="h-12"
            loading={lock.locked.has('cancel')}
            onClick={async () => {
              if (!lock.acquire('cancel')) return;
              try {
                await cancel(data.own!.id).unwrap();
              } catch {
                toast.error(t('duel action failed'));
              } finally {
                lock.release('cancel');
              }
            }}
          >
            {t('duel cancel lobby')}
          </Button>
        ) : (
          <Button
            className="h-14"
            disabled={tickets < min || lock.locked.has('create')}
            onClick={() => {
              setStake(min);
              setPicking(true);
            }}
          >
            {t('duel create lobby')}
          </Button>
        )}
      </div>
    </div>
  );
}
