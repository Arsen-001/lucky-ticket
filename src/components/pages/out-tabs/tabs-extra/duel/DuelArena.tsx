'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { DuelGameHeader } from '@/components/pages/out-tabs/tabs-extra/duel/DuelGameHeader';
import { DuelHand } from '@/components/pages/out-tabs/tabs-extra/duel/DuelHand';
import { DuelPicks } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPicks';
import { DuelSide } from '@/components/pages/out-tabs/tabs-extra/duel/DuelSide';
import { DuelToken } from '@/components/pages/out-tabs/tabs-extra/duel/DuelToken';
import { DuelWaiting } from '@/components/pages/out-tabs/tabs-extra/duel/DuelWaiting';
import { DUEL_MOVE_LABEL } from '@/components/pages/out-tabs/tabs-extra/duel/duel.tokens';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useInFlightLock } from '@/hooks/useInFlightLock';
import { useToast } from '@/hooks/useToast';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { rtkTags } from '@/constants/rtk-tags';
import { refetchTestQuestProgress } from '@/api/testQuest.api';
import {
  duelApi,
  useCancelDuelMutation,
  useGetDuelStateQuery,
  useMoveDuelMutation,
  useReadyDuelMutation,
} from '@/api/duel.api';
import { duelBeats, duelRoundWon } from '@/utils/global/duel.utils';
import type { DuelMove } from '@/types/interfaces/duel.interfaces';
import '@/styles/components/duel.css';

/** В бою состояние опрашивается часто: раунд длится считаные секунды. */
const POLL_FAST = 600;
/**
 * Когда ход уже сделан и ждём вскрытия — чаще.
 *
 * Это единственный момент, где задержка видна: оба сходили, результат уже
 * решён сервером, и лишние полсекунды читаются как зависший экран.
 */
const POLL_REVEAL = 300;

export interface DuelArenaProps {
  duelId: string;
  tickets: number;
  /** Лобби открыли ради конкретных людей — список друзей показываем сразу. */
  openInvite?: boolean;
  onLeave: () => void;
}

/**
 * Арена: ожидание соперника, готовность и матч — одним экраном.
 *
 * Отдельного экрана подтверждения нет намеренно. Арена уже стоит: соперник
 * сверху, вы снизу, жетоны лежат рубашкой вверх, — а внизу вместо трёх жетонов
 * одна кнопка «Я готов». Шаг не читается как лишний, потому что ничего не
 * переключается: меняется только то, что лежит под руками.
 */
export function DuelArena({ duelId, tickets, openInvite, onLeave }: DuelArenaProps) {
  const t = useAppTranslations();
  const toast = useToast();
  // Замок, а не `isLoading`: перерисовка, гасящая кнопку, может опоздать на
  // кадр, и два быстрых тапа уходят оба. В матче на пять секунд быстрые тапы —
  // норма, а не злоупотребление.
  const lock = useInFlightLock();
  const dispatch = useAppDispatch();
  const [now, setNow] = useState(() => Date.now());
  /**
   * Ход, который уже нажат, но сервером ещё не подтверждён.
   *
   * Раунд длится пять секунд, а круг до сервера плюс следующий опрос — до
   * секунды. Жетон, не загоревшийся сразу, читается как «не нажалось», и
   * игрок жмёт ещё раз. Поэтому выбранная фигура показывается в момент тапа,
   * а не в момент ответа; отказ сервера снимает её обратно.
   */
  const [pending, setPending] = useState<{ round: number; move: DuelMove } | null>(null);

  // Интервал зависит от фазы: пока ждём вскрытия — чаще, в остальное время
  // достаточно шестисот миллисекунд.
  const [awaitingReveal, setAwaitingReveal] = useState(false);
  const { data } = useGetDuelStateQuery(duelId, {
    pollingInterval: awaitingReveal ? POLL_REVEAL : POLL_FAST,
  });
  const [ready] = useReadyDuelMutation();
  const [move] = useMoveDuelMutation();
  const [cancel] = useCancelDuelMutation();

  const playing = data?.status === 'PLAYING';

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), playing ? 200 : 500);
    return () => clearInterval(id);
  }, [playing]);

  /**
   * Билеты двигаются не от моих тапов, а от хода матча: списываются, когда
   * ОБА подтвердили готовность, и возвращаются удвоенными на финале. Узнаёт
   * об этом арена из опроса, поэтому и список лобби с остатком билетов в
   * шапке обновляется отсюда, по смене статуса, — иначе после победы «4 tick.»
   * стояло над шапкой с прежним числом, а список ещё три секунды показывал
   * «Ваше лобби · 0:00» и «Закрыть лобби» от матча, который уже сыгран.
   */
  const seenStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const status = data?.status;
    if (!status || seenStatusRef.current === status) return;
    const first = seenStatusRef.current === undefined;
    seenStatusRef.current = status;
    if (first) return;
    if (status === 'PLAYING' || status === 'FINISHED' || status === 'CANCELLED') {
      dispatch(duelApi.util.invalidateTags([rtkTags.duelLobbies, rtkTags.tickets]));
    }
    // Проигравший узнаёт о списании из опроса, а не из своего хода — чек-лист
    // тест-квеста считает билеты и должен увидеть это у обеих сторон.
    if (status === 'FINISHED') refetchTestQuestProgress(dispatch);
  }, [data?.status]);

  // «Оба сходили, ждём картинку» — единственная фаза, где задержка заметна.
  useEffect(() => {
    const both = Boolean(data?.me.move) && Boolean(data?.foe.moved);
    setAwaitingReveal(both && !data?.round?.revealed);
  }, [data?.me.move, data?.foe.moved, data?.round?.revealed]);

  /**
   * Лобби живёт, пока игрок на экране дуэли.
   *
   * Ушёл назад — лобби закрывается: висящее в списке лобби без хозяина обманывает
   * всех остальных. Кто-то тапнет «Войти», потратит десять секунд готовности и
   * получит несостоявшийся матч.
   *
   * Только для фазы ожидания. Уже начатый матч уходом не отменяется — иначе
   * «назад» стало бы способом не проигрывать, а ставки к тому моменту списаны
   * у обоих. Матч доигрывается без ушедшего (@see resolve на сервере).
   */
  const statusRef = useRef<string | undefined>(undefined);
  const awaitingInviteRef = useRef(false);
  statusRef.current = data?.status;
  awaitingInviteRef.current = Boolean(data?.awaitingInvite);
  useEffect(
    () => () => {
      // Кроме одного случая: если позвали живого и ответ ещё не пришёл, лобби
      // держится. Иначе выходило так, что зовущий свернул экран на минуту, а
      // пришедший по ссылке получил «лобби уже занято».
      if (statusRef.current === 'WAITING' && !awaitingInviteRef.current) {
        cancel(duelId);
      }
    },
    [duelId]
  );

  useEffect(() => {
    if (data?.status === 'CANCELLED') {
      const reason = data.cancelReason ?? 'expired';
      toast.error(t(`duel cancel ${reason}`));
      onLeave();
    }
  }, [data?.status, data?.cancelReason]);

  if (!data) return null;

  const secondsLeft = (iso: string | null) =>
    iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 1000)) : 0;

  const handleReady = async () => {
    if (!lock.acquire('ready')) return;
    try {
      await ready(duelId).unwrap();
    } catch {
      toast.error(t('duel action failed'));
    } finally {
      lock.release('ready');
    }
  };

  const handleMove = async (picked: DuelMove) => {
    // Ключ с номером раунда: ход в следующем раунде — новое действие, а второй
    // тап в этом же — тот самый повтор, который сервер и так не примет.
    const roundIndex = data?.round?.index ?? 0;
    const key = `move-${roundIndex}`;
    if (!lock.acquire(key)) return;
    setPending({ round: roundIndex, move: picked });
    try {
      await move({ id: duelId, move: picked }).unwrap();
    } catch {
      setPending(null);
      toast.error(t('duel move failed'));
    } finally {
      lock.release(key);
    }
  };

  // Своё лобби до прихода соперника — отдельная картина, а не пустая арена.
  if (data.status === 'WAITING') {
    return (
      <div className="flex h-full flex-col">
        <DuelGameHeader tickets={tickets} />
        <DuelWaiting
          duelId={duelId}
          invitedName={data.invitedName}
          openInvite={openInvite}
          stake={data.stake}
          seconds={data.waitingSeconds}
          cancelling={lock.locked.has('cancel')}
          onCancel={async () => {
            // Кнопка делает ровно то, что обещает: закрывает лобби, а не
            // просто уводит с экрана, оставив его висеть в списке. И крутит
            // лоадер, пока сервер отвечает: без него экран секунду не менялся,
            // и тап выглядел непринятым.
            if (!lock.acquire('cancel')) return;
            try {
              await cancel(duelId).unwrap();
            } catch {
              toast.error(t('duel action failed'));
            } finally {
              lock.release('cancel');
            }
            onLeave();
          }}
          className="flex-1"
        />
      </div>
    );
  }

  const foeName = data.opponent?.name ?? t('duel waiting for opponent');
  const revealed = Boolean(data.round?.revealed);
  const finished = data.status === 'FINISHED';
  const iWon = data.winner === (data.role === 'host' ? 'HOST' : 'GUEST');
  const readiness = data.status === 'READY';

  // Ничья приходит как `winner: 'DRAW'` — это не «решено не в мою пользу»,
  // а «не решено»: без этой оговорки треть раундов показывалась проигрышем.
  const roundWon = revealed ? duelRoundWon(data.round?.winner, data.role) : null;
  const myState = roundWon === null ? 'idle' : roundWon ? 'win' : 'lose';
  const foeState = roundWon === null ? 'idle' : roundWon ? 'lose' : 'win';
  const beats = revealed ? duelBeats(data.me.move, data.foe.move) : null;
  // Нажатый, но ещё не подтверждённый ход показывается как сделанный — только
  // в своём раунде: сервер мог уже открыть следующий.
  const myMove =
    data.me.move ?? (pending && pending.round === data.round?.index ? pending.move : null);

  return (
    <div className="flex h-full flex-col">
      <DuelGameHeader tickets={tickets} />

      {/* ── сторона соперника ── */}
      <div className="flex flex-1 flex-col items-center gap-2.5">
        <DuelSide
          name={foeName}
          avatarUrl={data.opponent?.avatarUrl || undefined}
          wins={data.foe.wins}
          winsNeeded={data.winsNeeded}
          ringed={readiness ? data.foe.ready : true}
          badge={
            readiness
              ? {
                  text: data.foe.ready ? t('duel ready') : t('duel foe waiting'),
                  tone: data.foe.ready ? 'ready' : 'idle',
                }
              : playing && data.foe.moved && !revealed
                ? { text: t('duel moved'), tone: 'moved' }
                : null
          }
        />

        {/* Его рука — сразу под именем: это его сторона стола. */}
        {!readiness && (
          <DuelHand
            className="w-full"
            thinking={playing && !data.foe.moved && !revealed}
            revealed={revealed ? data.foe.move : null}
          />
        )}

        <DuelToken
          move={revealed ? data.foe.move : null}
          size={118}
          state={foeState}
          className={revealed ? 'duel-drop' : ''}
        />
      </div>

      {/* ── середина: что сейчас происходит ── */}
      <div className="flex min-h-[70px] flex-col items-center justify-center gap-0.5 border-y border-white/6 px-2 py-2 text-center">
        {finished ? (
          <>
            <span
              className={twMerge(
                'text-[21px] font-extrabold',
                iWon ? 'text-gold' : 'text-error-text'
              )}
            >
              {iWon ? t('duel you won') : t('duel you lost')}
            </span>
            <span className="text-pink-secondary text-[11px]">
              {t('duel stake tickets', { count: data.stake * 2 })}
            </span>
          </>
        ) : readiness ? (
          <span className="text-gray-secondary text-[13px]">{t('duel both must confirm')}</span>
        ) : revealed ? (
          <>
            <span
              className={twMerge(
                'text-[19px] font-extrabold',
                roundWon === null
                  ? 'text-gray-secondary'
                  : roundWon
                    ? 'text-gold'
                    : 'text-error-text'
              )}
            >
              {roundWon === null
                ? t('duel draw')
                : roundWon
                  ? t('duel round yours')
                  : t('duel round theirs')}
            </span>
            {beats && (
              <span className="text-pink-secondary text-[11px]">
                {t('duel round beats', {
                  winner: t(DUEL_MOVE_LABEL[beats.winner]),
                  loser: t(DUEL_MOVE_LABEL[beats.loser]),
                })}
              </span>
            )}
          </>
        ) : (
          <>
            {!myMove && (
              <span
                className={twMerge(
                  'text-2xl font-extrabold tabular-nums',
                  secondsLeft(data.round?.deadline ?? null) <= 2 ? 'text-error-text' : 'text-gold'
                )}
              >
                {secondsLeft(data.round?.deadline ?? null)}
              </span>
            )}
            <span className="text-gray-secondary text-[13px]">
              {myMove ? t('duel move accepted') : t('duel pick a token')}
            </span>
          </>
        )}
      </div>

      {/* ── моя сторона ── */}
      <div className="flex flex-1 flex-col items-center justify-end gap-2.5">
        <DuelToken
          move={myMove}
          size={124}
          state={myState}
          className={revealed ? 'duel-drop' : ''}
        />
        <DuelSide
          name={t('duel you')}
          wins={data.me.wins}
          winsNeeded={data.winsNeeded}
          ringed={readiness ? data.me.ready : true}
          badge={
            readiness
              ? {
                  text: data.me.ready ? t('duel ready') : t('duel not ready'),
                  tone: data.me.ready ? 'ready' : 'idle',
                }
              : null
          }
        />
      </div>

      {/* ── низ: готовность или жетоны ── */}
      <div className="mt-3 flex flex-col gap-2">
        {readiness && (
          <>
            <div className="text-disabled flex items-center justify-between text-[11px]">
              <span>
                {t('duel stake short')}{' '}
                <span className="text-gold font-bold">
                  {t('duel stake tickets', { count: data.stake })}
                </span>
                {data.role === 'guest' && data.opponent
                  ? ` · ${t('duel lobby of', { name: data.opponent.name })}`
                  : ''}
              </span>
              <span className="text-gold text-[15px] font-extrabold tabular-nums">
                {secondsLeft(data.readyDeadline)}
              </span>
            </div>
            <span className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <span
                className="bg-pink-gradient block h-full origin-left transition-transform duration-500"
                style={{
                  transform: `scaleX(${Math.max(0, Math.min(1, secondsLeft(data.readyDeadline) / 10))})`,
                }}
              />
            </span>
            <Button
              className="h-14 bg-success"
              loading={lock.locked.has('ready')}
              disabled={data.me.ready}
              onClick={handleReady}
            >
              {data.me.ready ? t('duel waiting for opponent') : t('duel i am ready')}
            </Button>
          </>
        )}

        {playing && (
          <DuelPicks chosen={myMove} disabled={lock.locked.size > 0} onPick={handleMove} />
        )}

        {finished && (
          <Button className="h-14" onClick={onLeave}>
            {t('duel back to lobbies')}
          </Button>
        )}
      </div>
    </div>
  );
}
