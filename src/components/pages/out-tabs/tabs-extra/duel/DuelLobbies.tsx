'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { DuelLobbyRow } from '@/components/pages/out-tabs/tabs-extra/duel/DuelLobbyRow';
import { DuelStakeBadge } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakeBadge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import {
  useCancelDuelMutation,
  useCreateDuelMutation,
  useGetDuelLobbiesQuery,
  useJoinDuelMutation,
} from '@/api/duel.api';

export interface DuelLobbiesProps {
  onEnter: (duelId: string) => void;
}

/**
 * Список лобби и создание своего.
 *
 * Экран открывается сразу этим: играть можно с первого касания, без единого
 * перехода — поэтому «Создать лобби» лежит внизу, в зоне большого пальца, а не
 * прячется за плюсом в шапке.
 */
export function DuelLobbies({ onEnter }: DuelLobbiesProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const [picking, setPicking] = useState(false);
  const [stake, setStake] = useState(1);
  const [busy, setBusy] = useState(false);

  const { data, isLoading, isError, refetch } = useGetDuelLobbiesQuery(undefined, {
    pollingInterval: 3000,
  });
  const [create] = useCreateDuelMutation();
  const [join] = useJoinDuelMutation();
  const [cancel] = useCancelDuelMutation();

  const tickets = data?.tickets ?? 0;
  const min = data?.stakeMin ?? 1;
  const max = data?.stakeMax ?? 5;

  const handleCreate = async () => {
    setBusy(true);
    try {
      const duel = await create({ stake }).unwrap();
      setPicking(false);
      onEnter(duel.id);
    } catch {
      toast.error(t('duel action failed'));
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (id: string) => {
    setBusy(true);
    try {
      const duel = await join(id).unwrap();
      onEnter(duel.id);
    } catch {
      toast.error(t('duel action failed'));
    } finally {
      setBusy(false);
    }
  };

  // Пока этого не было, отказ сервера выглядел как «у вас нет билетов»: без
  // данных `tickets` равен нулю, и кнопка «Создать лобби» просто гасла.
  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  /** Шапка игры: лига слева, свой запас билетов справа. */
  const header = (
    <div className="flex items-center justify-between px-0.5">
      <span className="text-pink-secondary text-[11px] font-black tracking-[0.14em] uppercase">
        {t('duel league bronze')}
      </span>
      <span className="text-gold flex items-center gap-1.5 text-sm font-extrabold tabular-nums">
        <Ticket type="bronze" width={26} height={13} className="h-auto w-[26px]" />
        {tickets}
      </span>
    </div>
  );

  if (picking) {
    return (
      <div className="flex min-h-full flex-col gap-3">
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
          <Button className="h-14" loading={busy} onClick={handleCreate}>
            {t('duel open lobby')}
          </Button>
          <Button variant="transparent" className="h-12" onClick={() => setPicking(false)}>
            {t('duel back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-3">
      {header}

      <div className="text-pink-secondary flex items-baseline justify-between text-[10px] font-black tracking-[0.16em] uppercase">
        <span>{t('duel open lobbies')}</span>
        <span className="tabular-nums">{data?.lobbies.length ?? 0}</span>
      </div>

      {data?.own && (
        <button
          type="button"
          onClick={() => onEnter(data.own!.id)}
          className="border-gold/45 from-gold/10 flex items-center gap-3 rounded-2xl border bg-gradient-to-b to-transparent p-3 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">{t('duel your lobby')}</span>
            <span className="text-disabled block text-[11px]">
              {t('duel waiting seconds', { count: data.own.waitingSeconds })}
            </span>
          </span>
          <DuelStakeBadge stake={data.own.stake} />
        </button>
      )}

      {!isLoading && !data?.lobbies.length && !data?.own && (
        <p className="text-disabled px-6 py-7 text-center text-[13px] leading-relaxed">
          {t('duel no lobbies')}
        </p>
      )}

      {data?.lobbies.map(lobby => (
        <DuelLobbyRow key={lobby.id} lobby={lobby} busy={busy} onJoin={handleJoin} />
      ))}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {!data?.own && (
          <p className="text-pink-secondary px-1 text-[11px] leading-snug">
            {t('duel lobby hint')}
          </p>
        )}
        {data?.own ? (
          <Button variant="transparent" className="h-12" onClick={() => cancel(data.own!.id)}>
            {t('duel cancel lobby')}
          </Button>
        ) : (
          <Button
            className="h-14"
            disabled={tickets < min}
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
