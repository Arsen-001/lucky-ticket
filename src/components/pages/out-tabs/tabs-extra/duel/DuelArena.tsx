'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { DuelGameHeader } from '@/components/pages/out-tabs/tabs-extra/duel/DuelGameHeader';
import { DuelHand } from '@/components/pages/out-tabs/tabs-extra/duel/DuelHand';
import { DuelPicks } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPicks';
import { DuelReadyMark } from '@/components/pages/out-tabs/tabs-extra/duel/DuelReadyMark';
import { DuelSeriesChip } from '@/components/pages/out-tabs/tabs-extra/duel/DuelSeriesChip';
import { DuelSide } from '@/components/pages/out-tabs/tabs-extra/duel/DuelSide';
import { DuelStakeAmount } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakeAmount';
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
  useRematchDuelMutation,
} from '@/api/duel.api';
import {
  duelBeats,
  duelJoinFailure,
  duelMatchInProgress,
  duelRoundWon,
} from '@/utils/global/duel.utils';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import type { DuelMove, DuelTier } from '@/types/interfaces/duel.interfaces';
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
  /** Сколько всего даётся на подтверждение — число правит панель. */
  readySeconds?: number;
  /**
   * Билеты по лигам.
   *
   * В шапке стоит кошелёк ЭТОЙ лиги: за золотым столом «17» бронзовых билетов
   * — не тот остаток, которым игрок рискует.
   */
  balances?: Readonly<Record<DuelTier, number>>;
  /** Лобби открыли ради конкретных людей — список друзей показываем сразу. */
  openInvite?: boolean;
  onLeave: () => void;
  /** Реванш открыт или принят — арена переключается на новый матч. */
  onRematch: (duelId: string) => void;
}

/**
 * Арена: ожидание соперника, готовность и матч — одним экраном.
 *
 * Отдельного экрана подтверждения нет намеренно. Арена уже стоит: соперник
 * сверху, вы снизу, жетоны лежат рубашкой вверх, — а внизу вместо трёх жетонов
 * одна кнопка «Я готов». Шаг не читается как лишний, потому что ничего не
 * переключается: меняется только то, что лежит под руками.
 */
export function DuelArena({
  duelId,
  tickets,
  readySeconds,
  balances,
  openInvite,
  onLeave,
  onRematch,
}: DuelArenaProps) {
  const t = useAppTranslations();
  const toast = useToast();
  // Замок, а не `isLoading`: перерисовка, гасящая кнопку, может опоздать на
  // кадр, и два быстрых тапа уходят оба. В матче на пять секунд быстрые тапы —
  // норма, а не злоупотребление.
  const lock = useInFlightLock();
  const dispatch = useAppDispatch();
  const spend = useSpendFailure();
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
  const [rematch] = useRematchDuelMutation();

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
      //
      // Уход на фазе готовности — тоже уход: хозяин закрывает лобби (гость
      // сразу видит «лобби закрыто», а не отсиживает весь отсчёт), гость
      // освобождает место (лобби хозяина возвращается в ожидание). Сервер
      // различает роли сам. Идущий матч этим не трогается — он не WAITING и не
      // READY.
      const status = statusRef.current;
      if (status === 'READY' || (status === 'WAITING' && !awaitingInviteRef.current)) {
        cancel(duelId);
      }
    },
    [duelId]
  );

  // Гость ушёл (или не подтвердил) — хозяин возвращается в ожидание молча.
  // Говорим об этом словами: иначе экран готовности просто сменился ожиданием,
  // и непонятно, что случилось.
  const prevStatusRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = data?.status;
    if (prev === 'READY' && data?.status === 'WAITING' && data.role === 'host') {
      toast.info(t('duel cancel guest_not_ready'));
    }
  }, [data?.status]);

  useEffect(() => {
    if (data?.status === 'CANCELLED') {
      const reason = data.cancelReason ?? 'expired';
      // Причина одна, а слова — по роли: «вы не подтвердили» хозяину и
      // «соперник не подтвердил» гостю, который как раз подтвердил.
      const key =
        reason === 'host_not_ready' && data.role === 'guest'
          ? ('duel cancel host_not_ready guest' as const)
          : (`duel cancel ${reason}` as const);
      toast.error(t(key));
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

  const handleRematch = async () => {
    if (!lock.acquire('rematch')) return;
    try {
      const next = await rematch(duelId).unwrap();
      // Сопернику вызов не дошёл — предложивший узнаёт почему, а не ждёт впустую.
      const inv = next.rematchInvite;
      if (inv && inv.invited === 0) {
        if (inv.unaffordable > 0) toast.error(t('duel invite unaffordable'));
        else if (inv.refused > 0) toast.error(t('duel invite refused'));
        else if (inv.unavailable > 0) toast.error(t('duel invite unavailable'));
      }
      onRematch(next.id);
    } catch (error) {
      if (duelMatchInProgress(error)) toast.info(t('duel match in progress'));
      else if (duelJoinFailure(error) === 'tickets')
        await spend.report(error, { required: data?.stake });
      else toast.error(t('duel action failed'));
    } finally {
      lock.release('rematch');
    }
  };

  // Своё лобби до прихода соперника — отдельная картина, а не пустая арена.
  if (data.status === 'WAITING') {
    return (
      <div className="flex h-full flex-col">
        <DuelGameHeader tickets={balances?.[data.tier] ?? tickets} tier={data.tier} />
        <DuelWaiting
          duelId={duelId}
          invitedName={data.invitedName}
          openInvite={openInvite}
          stake={data.stake}
          tier={data.tier}
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

  /**
   * Чем меряется полоса готовности.
   *
   * Здесь была вшита десятка, а `readySeconds` в панели давно пятнадцать:
   * первые пять секунд полоса стояла полной и трогалась только с десятой.
   * Число приходит с сервера тем же ответом, что и список лобби; текущий
   * остаток взят полом на случай, если ответ ещё не доехал, — тогда полоса
   * начнёт с полной и поедет честно, а не соврёт.
   */
  const readyTotal = Math.max(1, readySeconds ?? 0, secondsLeft(data.readyDeadline));

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
      {spend.modals}
      <DuelGameHeader
        tickets={balances?.[data.tier] ?? tickets}
        tier={data.tier}
        round={playing ? (data.round?.index ?? 0) + 1 : null}
      />

      {/* Счёт серии — «вы : соперник», по людям, не по сторонам стола. */}
      {data.series && data.series.matches > 0 && (
        <DuelSeriesChip mine={data.series.mine} theirs={data.series.theirs} className="mt-2" />
      )}

      {/* Сукно лежит под всеми тремя блоками разом: руки соперника и мои — по
          две стороны одного стола, а не два отдельных списка.

          `duel-stage` — сетка «половина · табличка · половина»: половины равны
          по определению, поэтому табличка стоит ровно посередине, а стороны
          зеркальны по составу и центрированы каждая в своей половине. */}
      <div className="duel-felt duel-stage">
        {/* ── сторона соперника ── */}
        <div className="flex flex-col items-center justify-center gap-2.5">
          <DuelSide
            name={foeName}
            avatarUrl={data.opponent?.avatarUrl || undefined}
            // На готовности счёта нет: матч ещё не начался, и ноль там не
            // значит ничего — длину матча называет табличка словами.
            wins={readiness ? null : data.foe.wins}
            winsNeeded={data.winsNeeded}
            leading={data.foe.wins > data.me.wins}
            ringed={readiness ? data.foe.ready : true}
            badge={
              !readiness && playing && data.foe.moved && !revealed
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

          {readiness ? (
            <DuelReadyMark
              ready={data.foe.ready}
              caption={data.foe.ready ? t('duel ready confirmed') : t('duel foe waiting')}
              captionFirst
            />
          ) : (
            <DuelToken
              move={revealed ? data.foe.move : null}
              size={118}
              state={foeState}
              className={revealed ? 'duel-drop' : ''}
            />
          )}
        </div>

        {/* ── середина: что сейчас происходит ── */}
        <div className="duel-plate flex min-h-[70px] flex-col items-center justify-center gap-0.5 rounded-[14px] px-2 py-2 text-center">
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
              {/* Раньше здесь стояло «4 бил.» независимо от исхода — проигравший
                  читал под словом «Поражение» размер чужого выигрыша. */}
              <span
                className={twMerge(
                  'text-[12.5px] font-extrabold tabular-nums',
                  iWon ? 'text-gold' : 'text-pink-secondary'
                )}
              >
                {iWon
                  ? t('duel took tickets', { count: data.stake * 2 })
                  : t('duel lost tickets', { count: data.stake })}
              </span>
            </>
          ) : readiness ? (
            <>
              {/* Длину матча называет табличка словами — счёт 0:0 на этой фазе
                  убран: матча ещё нет, и ноль там не значит ничего. */}
              <span className="text-[16px] font-extrabold">
                {t('duel match to wins', { count: data.winsNeeded })}
              </span>
              <span className="text-gray-secondary text-[13px]">{t('duel both must confirm')}</span>
            </>
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
        {/* Зеркало верхней стороны: жетон у таблички, следом рука (у меня это
            кнопки хода), имя с краю. Раз состав половин одинаковый, обе просто
            центрируются — и расстояния до таблички и до краёв равны сами. */}
        <div className="flex flex-col items-center justify-center gap-2.5">
          {readiness ? (
            <DuelReadyMark
              ready={data.me.ready}
              caption={data.me.ready ? t('duel ready confirmed') : t('duel ready waiting you')}
            />
          ) : (
            <DuelToken
              move={myMove}
              size={118}
              state={myState}
              className={revealed ? 'duel-drop' : ''}
            />
          )}
          {/* Рука игрока стоит ЗДЕСЬ, а не в нижнем блоке: она зеркалит руку
              соперника сверху, и стол читается как стол.

              На финале она тоже остаётся — только не нажимается: у соперника
              сверху рука никуда не делась, и без моей половины расходятся по
              высоте. Строка счёта серии тогда налезала на имя соперника. */}
          {(playing || finished) && (
            <DuelPicks
              chosen={myMove}
              disabled={finished || lock.locked.size > 0}
              onPick={handleMove}
              className="w-full"
            />
          )}

          <DuelSide
            name={t('duel you')}
            wins={readiness ? null : data.me.wins}
            winsNeeded={data.winsNeeded}
            leading={data.me.wins > data.foe.wins}
            ringed={readiness ? data.me.ready : true}
          />
        </div>
      </div>

      {/* ── низ: готовность или жетоны ── */}
      <div className="mt-3 flex flex-col gap-2">
        {readiness && (
          <>
            <div className="text-disabled flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1">
                {t('duel stake short')}{' '}
                {/* Число с билетом, а не «2 бил.»: та же запись, что в списке и
                    на экране ставки, — сумма читается одинаково везде. */}
                <DuelStakeAmount stake={data.stake} tier={data.tier} size="sm" />
                {data.role === 'guest' && data.opponent
                  ? ` · ${t('duel lobby of', { name: data.opponent.name })}`
                  : ''}
              </span>
              <span
                className={twMerge(
                  'text-[15px] font-extrabold tabular-nums',
                  secondsLeft(data.readyDeadline) <= 3 ? 'text-error-text' : 'text-gold'
                )}
              >
                {secondsLeft(data.readyDeadline)}
              </span>
            </div>
            <span className="h-1 w-full overflow-hidden rounded-full bg-black/40">
              <span
                className="bg-gold block h-full origin-left transition-transform duration-500"
                style={{
                  transform: `scaleX(${Math.max(0, Math.min(1, secondsLeft(data.readyDeadline) / readyTotal))})`,
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

        {finished && (
          <>
            {/* Реванш никогда не стартует сам: один открывает, второй принимает.
                Оба нажатия сходятся в один стол — сервер так решает. Соперник
                предложил — говорим это словами, а не только подписью кнопки. */}
            {data.rematch && !data.rematch.mine && (
              <span className="text-gold animation-blink text-center text-[13px] font-bold">
                {t('duel rematch offered')}
              </span>
            )}
            {data.rematch?.mine ? (
              <Button className="h-14" disabled>
                {t('duel rematch waiting')}
              </Button>
            ) : (
              <Button
                // Зелёная, когда ход мой: соперник уже предложил и ждёт. Тем же
                // зелёным подтверждают готовность к матчу — цвет значит «ждут
                // твоего слова», а не «важная кнопка». Розовой оставалась бы
                // неотличимой от «предложить реванш», и по экрану нельзя было
                // понять, чей сейчас ход.
                className={twMerge('h-14', data.rematch && !data.rematch.mine && 'bg-success')}
                loading={lock.locked.has('rematch')}
                onClick={handleRematch}
              >
                {data.rematch ? t('duel accept rematch') : t('duel play again')}
              </Button>
            )}
            <Button variant="transparent" className="h-12" onClick={onLeave}>
              {t('duel back to lobbies')}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
