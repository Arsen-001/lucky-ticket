'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { DuelStage } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStage';
import { DuelStakeBadge } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakeBadge';
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

  // Пока этого не было, отказ сервера выглядел как «у вас нет билетов»:
  // без данных `tickets` равен нулю, и кнопка «Создать лобби» просто гасла.
  // Ровно так и выглядел живой отказ 20.08 — список падал 500, а экран
  // молчал и показывал заблокированную кнопку.
  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  if (picking) {
    return (
      <div className="flex-col-stretch flex-available gap-3">
        <div className="flex items-baseline justify-between text-[11px] tracking-wider text-disabled uppercase">
          <span>{t('duel choose stake')}</span>
          <span>
            {tickets} {t('duel tickets left')}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: max }, (_, i) => i + 1).map(value => (
            <button
              key={value}
              type="button"
              aria-pressed={stake === value}
              disabled={value > tickets}
              onClick={() => setStake(value)}
              className={twMerge(
                'flex-col-stretch h-16 items-center justify-center rounded-2xl border',
                'border-white/10 bg-background-overlay transition disabled:opacity-30',
                stake === value && 'border-gold bg-gold/10 text-gold'
              )}
            >
              <span className="text-lg font-bold">{value}</span>
            </button>
          ))}
        </div>

        <p className="text-xs leading-relaxed text-disabled">{t('duel stake note')}</p>

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
    <div className="flex-col-stretch flex-available gap-3">
      <DuelStage
        winsNeeded={data?.winsNeeded ?? 2}
        stakeMin={min}
        stakeMax={max}
        moveSeconds={data?.moveSeconds ?? 5}
      />

      <div className="flex items-baseline justify-between text-[11px] tracking-wider text-disabled uppercase">
        <span>
          {t('duel open lobbies')}
          {data?.lobbies.length ? ' · ' + data.lobbies.length : ''}
        </span>
        <span>
          {tickets} {t('duel tickets left')}
        </span>
      </div>

      {data?.own && (
        <button
          type="button"
          onClick={() => onEnter(data.own!.id)}
          className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold/5 p-3 text-left"
        >
          <span className="flex-1">
            <span className="block text-sm font-bold">{t('duel your lobby')}</span>
            <span className="block text-xs text-disabled">{t('duel waiting for opponent')}</span>
          </span>
          <DuelStakeBadge stake={data.own.stake} />
        </button>
      )}

      {!isLoading && !data?.lobbies.length && !data?.own && (
        <p className="py-8 text-center text-sm text-disabled">{t('duel no lobbies')}</p>
      )}

      {data?.lobbies.map(lobby => (
        <div
          key={lobby.id}
          className="flex items-center gap-3 rounded-2xl border border-white/8 bg-background-overlay p-3"
        >
          <span className="flex-center size-9 rounded-full bg-surface-hover text-sm font-bold text-gray-secondary">
            {lobby.host.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">{lobby.host.name}</span>
            <span className="block text-xs text-disabled">
              {t('duel waiting seconds', { count: lobby.waitingSeconds })}
            </span>
          </span>
          <DuelStakeBadge stake={lobby.stake} />
          <Button className="h-9 px-4 text-xs" loading={busy} onClick={() => handleJoin(lobby.id)}>
            {t('duel join')}
          </Button>
        </div>
      ))}

      {!data?.own && (
        <p className="text-pink-secondary px-1 text-[11px] leading-snug">{t('duel lobby hint')}</p>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {data?.own ? (
          <Button variant="transparent" className="h-12" onClick={() => cancel(data.own!.id)}>
            {t('duel cancel lobby')}
          </Button>
        ) : (
          <Button
            className="h-14"
            disabled={tickets < 1}
            onClick={() => {
              setStake(1);
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
