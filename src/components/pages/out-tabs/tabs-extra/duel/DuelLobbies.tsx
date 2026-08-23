'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { DuelGameHeader } from '@/components/pages/out-tabs/tabs-extra/duel/DuelGameHeader';
import { DuelInviteModal } from '@/components/pages/out-tabs/tabs-extra/duel/DuelInviteModal';
import { DuelLobbyRow } from '@/components/pages/out-tabs/tabs-extra/duel/DuelLobbyRow';
import { DuelPotPreview } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPotPreview';
import { DuelRulesModal } from '@/components/pages/out-tabs/tabs-extra/duel/DuelRulesModal';
import { DuelTierFilter } from '@/components/pages/out-tabs/tabs-extra/duel/DuelTierFilter';
import { DuelStakeAmount } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakeAmount';
import { DuelStakePicker } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakePicker';
import { DuelTablePanel } from '@/components/pages/out-tabs/tabs-extra/duel/DuelTablePanel';
import {
  DUEL_TIERS,
  DuelTierPicker,
} from '@/components/pages/out-tabs/tabs-extra/duel/DuelTierPicker';
import { duelClock, duelJoinFailure, duelMatchInProgress } from '@/utils/global/duel.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useInFlightLock } from '@/hooks/useInFlightLock';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { useToast } from '@/hooks/useToast';
import type { DuelTier } from '@/types/interfaces/duel.interfaces';
import {
  useCancelDuelMutation,
  useCreateDuelMutation,
  useGetDuelLobbiesQuery,
  useInviteToDuelMutation,
  useJoinDuelMutation,
} from '@/api/duel.api';
import { useGetProfileQuery } from '@/api/profile.api';
import '@/styles/components/duel.css';

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
  // Лига — то есть каким билетом играем. Бронза по умолчанию: она расходная,
  // её на руках у всех больше всего.
  const [tier, setTier] = useState<DuelTier>('bronze');
  // Какая из двух кнопок создания нажата — лоадер крутит она одна, вторая
  // просто гаснет. Обе под одним замком `create`, чтобы второй тап не ушёл.
  const [creating, setCreating] = useState<'open' | 'friend' | null>(null);
  // «Играть с другом»: сначала выбор, кого позвать, — лобби создаётся вместе с
  // вызовом. Созданное здесь лобби запоминается, чтобы войти в него, когда
  // модалка закроется (она закрывается сама после отправки).
  const [pickingFriends, setPickingFriends] = useState(false);
  // Правила стола: читают один раз, поэтому живут под кнопкой «i».
  const [rulesOpen, setRulesOpen] = useState(false);
  // Какую лигу показывать в списке. `null` — все: столы разных лиг лежат
  // вперемешку, и по умолчанию видно всё, что вообще открыто.
  const [filterTier, setFilterTier] = useState<DuelTier | null>(null);
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
  // Свой счёт сыгранного — из профиля: он там уже посчитан и обычно лежит в
  // кеше. Отдельной ручки под это заводить не нужно.
  const { data: profile } = useGetProfileQuery(undefined);
  const [create] = useCreateDuelMutation();
  const [join] = useJoinDuelMutation();
  const [cancel] = useCancelDuelMutation();
  const [inviteToDuel] = useInviteToDuelMutation();

  const balances = data?.balances;
  // Кошелёк выбранной лиги: и потолок ставки, и число в шапке — из него.
  const tickets = balances ? (balances[tier] ?? 0) : (data?.tickets ?? 0);
  const min = data?.stakeMin ?? 1;
  const max = data?.stakeMax ?? 5;
  // Сколько столов ждёт соперника, считая своё.
  const open = (data?.lobbies.length ?? 0) + (data?.own ? 1 : 0);
  // Сколько столов в каждой лиге — цифра стоит на самой кнопке фильтра.
  const counts = DUEL_TIERS.reduce(
    (acc, next) => ({ ...acc, [next]: (data?.lobbies ?? []).filter(l => l.tier === next).length }),
    {} as Record<DuelTier, number>
  );
  const shown = (data?.lobbies ?? []).filter(l => !filterTier || l.tier === filterTier);

  const handleCreate = async () => {
    if (!lock.acquire('create')) return;
    setCreating('open');
    try {
      const duel = await create({ stake, tier }).unwrap();
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
    // Своё лобби этой лиги: чужой стол может быть золотым, когда у меня выбрана
    // бронза — считаем по лиге СТОЛА, а не по той, что открыта на экране.
    const affordFor = target ? (balances?.[target.tier] ?? tickets) : tickets;
    if (target && target.stake > affordFor) {
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

  // Лигу выбирают строкой ниже, поэтому в шапке её не называют ни там, ни там.
  // Справа в списке — весь кошелёк: столы лежат вперемешку, и одно число
  // отвечало бы только про одну лигу.
  const rules = data && (
    <DuelRulesModal
      open={rulesOpen}
      winsNeeded={data.winsNeeded}
      moveSeconds={data.moveSeconds}
      readySeconds={data.readySeconds}
      onClose={() => setRulesOpen(false)}
    />
  );

  if (picking) {
    return (
      <div className="duel-marks flex h-full flex-col gap-3">
        <DuelGameHeader
          tickets={tickets}
          tier={tier}
          showLeague={false}
          wallet={false}
          onInfo={data ? () => setRulesOpen(true) : undefined}
        />

        <span className="text-pink-secondary text-[10px] font-black tracking-[0.16em] uppercase">
          {t('duel choose tier')}
        </span>

        <DuelTierPicker
          value={tier}
          balances={balances ?? { bronze: tickets, silver: 0, gold: 0, platinum: 0, diamond: 0 }}
          onChange={next => {
            setTier(next);
            // Ставка не должна пережить смену лиги: пять золотых и пять
            // бронзовых — разные деньги, и потолок у них свой.
            setStake(Math.min(stake, Math.max(min, balances?.[next] ?? min)));
          }}
        />

        <span className="text-pink-secondary text-[10px] font-black tracking-[0.16em] uppercase">
          {t('duel choose stake')}
        </span>

        <DuelStakePicker
          value={stake}
          min={min}
          max={max}
          tickets={tickets}
          tier={tier}
          onChange={setStake}
        />

        <p className="text-disabled text-xs leading-relaxed">{t('duel stake note')}</p>

        <DuelPotPreview stake={stake} tier={tier} className="flex-1" />

        <div className="flex flex-col gap-2">
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
        {rules}
        <DuelInviteModal
          open={pickingFriends}
          stake={stake}
          tier={tier}
          onSend={async userIds => {
            if (!lock.acquire('create')) throw new Error('busy');
            setCreating('friend');
            try {
              const duel = await create({ stake, tier }).unwrap();
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
    <div className="duel-marks flex h-full flex-col gap-3">
      <DuelGameHeader
        tickets={tickets}
        showLeague={false}
        balances={balances}
        onInfo={data ? () => setRulesOpen(true) : undefined}
      />

      {/* Свой счёт стоит под кошельком, а не в хвосте списка: это строка про
          ИГРОКА, и читается она вместе с его билетами, а не после чужих столов.
          Правила стола уехали под кнопку «i» — их читают один раз. */}
      <DuelTablePanel
        matches={profile?.publicStats.duelMatches ?? 0}
        wins={profile?.publicStats.duelWins ?? 0}
      />

      {/* Лига выбирается сверху, а не разбивает список на группы: цифра на
          самой кнопке говорит, где есть с кем играть, и лишнее убирается одним
          тапом. Пустая лига видна и гаснет. */}
      {data && (
        <DuelTierFilter
          value={filterTier}
          counts={counts}
          total={data.lobbies.length}
          onChange={setFilterTier}
        />
      )}

      {/* Справа было слово «Ставка» — подпись колонки, которой нет: ставка
          стоит строкой под именем, а справа лежит кнопка входа. Теперь там
          число открытых столов: единственное, что здесь меняется. */}
      <div className="text-disabled flex items-baseline justify-between text-[10.5px] font-black tracking-[0.16em] uppercase">
        <span>{t('duel open lobbies')}</span>
        {open > 0 && <span className="text-gold tabular-nums">{open}</span>}
      </div>

      {data?.own && (
        <button
          type="button"
          onClick={() => onEnter(data.own!.id)}
          className="duel-rim duel-rim-on flex items-center gap-3 rounded-[14px] p-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold">{t('duel your lobby')}</span>
            {/* Своя строка читается так же, как чужие: сперва цена числом с
                билетом, следом приглушённое ожидание. */}
            <span className="mt-0.5 flex items-center gap-1.5">
              <DuelStakeAmount stake={data.own.stake} tier={data.own.tier} />
              <span className="text-disabled truncate text-[12px]">
                · {t('duel waiting for', { time: duelClock(data.own.waitingSeconds) })}
              </span>
            </span>
          </span>
        </button>
      )}

      {!isLoading && !shown.length && !data?.own && (
        <p className="text-disabled px-6 py-7 text-center text-[13px] leading-relaxed">
          {t('duel no lobbies')}
        </p>
      )}

      <div className="scrollbar-hidden flex flex-1 flex-col gap-2.5 overflow-y-auto">
        {shown.map(lobby => (
          <DuelLobbyRow
            key={lobby.id}
            lobby={lobby}
            busy={lock.locked.has(lobby.id)}
            affordable={lobby.stake <= (balances?.[lobby.tier] ?? tickets)}
            onJoin={handleJoin}
          />
        ))}
      </div>
      {spend.modals}
      {rules}

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
