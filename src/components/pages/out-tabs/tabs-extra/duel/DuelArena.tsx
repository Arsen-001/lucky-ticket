'use client';

import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useGetDuelStateQuery, useMoveDuelMutation, useReadyDuelMutation } from '@/api/duel.api';
import type { DuelMove } from '@/types/interfaces/duel.interfaces';
import { DuelToken } from './DuelToken';

const MOVES: DuelMove[] = ['ROCK', 'TICKET', 'SCISSORS'];

/** Подписи под жетонами. Явная карта, а не шаблонный ключ: `t()` типизирован по en.json. */
const MOVE_LABEL = {
  ROCK: 'duel move rock',
  TICKET: 'duel move ticket',
  SCISSORS: 'duel move scissors',
} as const;

/** В бою состояние опрашивается часто, в ожидании — редко. */
const POLL_FAST = 600;

export interface DuelArenaProps {
  duelId: string;
  onLeave: () => void;
}

/**
 * Арена: и готовность, и матч.
 *
 * Отдельного экрана подтверждения нет намеренно — кнопка «Я готов» стоит ровно
 * там, где через секунду появятся жетоны, поэтому шаг не читается как лишний.
 */
export function DuelArena({ duelId, onLeave }: DuelArenaProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const { data } = useGetDuelStateQuery(duelId, {
    pollingInterval: POLL_FAST,
  });
  const [ready] = useReadyDuelMutation();
  const [move] = useMoveDuelMutation();

  const playing = data?.status === 'PLAYING';

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), playing ? 200 : 500);
    return () => clearInterval(id);
  }, [playing]);

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

  const revealed = Boolean(data.round?.revealed);
  const myState =
    revealed && data.round?.winner
      ? data.round.winner === (data.role === 'host' ? 'HOST' : 'GUEST')
        ? 'win'
        : data.round.winner === 'DRAW'
          ? 'idle'
          : 'lose'
      : 'idle';
  const foeState = myState === 'win' ? 'lose' : myState === 'lose' ? 'win' : 'idle';

  const handleReady = async () => {
    setSending(true);
    try {
      await ready(duelId).unwrap();
    } catch {
      toast.error(t('duel action failed'));
    } finally {
      setSending(false);
    }
  };

  const handleMove = async (picked: DuelMove) => {
    setSending(true);
    try {
      await move({ id: duelId, move: picked }).unwrap();
    } catch {
      toast.error(t('duel move failed'));
    } finally {
      setSending(false);
    }
  };

  const pips = (wins: number) => (
    <span className="flex gap-1.5">
      {Array.from({ length: data.winsNeeded }).map((_, i) => (
        <span
          key={i}
          className={twMerge(
            'size-2 rounded-full',
            i < wins ? 'bg-gold shadow-[0_0_10px_rgba(248,189,62,0.8)]' : 'bg-pink-secondary/25'
          )}
        />
      ))}
    </span>
  );

  return (
    <div className="flex-col-stretch flex-available gap-2">
      {/* соперник сверху */}
      <div className="flex-col-stretch items-center gap-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-secondary">
            {data.opponent?.name ?? t('duel waiting for opponent')}
          </span>
          {data.status === 'READY' ? (
            <span
              className={twMerge(
                'rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                data.foe.ready
                  ? 'border-success-text/50 bg-success/15 text-success-text'
                  : 'border-white/10 text-disabled'
              )}
            >
              {data.foe.ready ? t('duel ready') : t('duel waiting')}
            </span>
          ) : (
            <>
              {pips(data.foe.wins)}
              {playing && data.foe.moved && !revealed && (
                <span className="rounded-full border border-gold/45 bg-gold/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold uppercase">
                  {t('duel moved')}
                </span>
              )}
            </>
          )}
        </div>
        <DuelToken move={revealed ? data.foe.move : null} size={124} state={foeState} />
      </div>

      {/* середина: исход или подсказка */}
      <div className="flex-col-stretch min-h-16 items-center justify-center gap-1 border-y border-white/5 py-2 text-center">
        {data.status === 'READY' && (
          <>
            <span className="text-2xl font-extrabold text-gold">
              {secondsLeft(data.readyDeadline)}
            </span>
            <span className="text-xs text-disabled">{t('duel both must confirm')}</span>
          </>
        )}
        {playing && (
          <span className="text-xs text-gray-secondary">
            {revealed
              ? data.round?.winner === 'DRAW'
                ? t('duel draw')
                : myState === 'win'
                  ? t('duel your round')
                  : t('duel their round')
              : data.me.move
                ? t('duel move accepted')
                : t('duel pick a token')}
          </span>
        )}
        {data.status === 'FINISHED' && (
          <span className="text-xl font-extrabold text-gold">
            {data.winner === (data.role === 'host' ? 'HOST' : 'GUEST')
              ? t('duel you won')
              : t('duel you lost')}
          </span>
        )}
      </div>

      {/* моя сторона снизу */}
      <div className="flex-col-stretch items-center gap-2">
        <DuelToken move={data.me.move} size={140} state={myState} />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{t('duel you')}</span>
          {data.status === 'READY' ? (
            <span
              className={twMerge(
                'rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase',
                data.me.ready
                  ? 'border-success-text/50 bg-success/15 text-success-text'
                  : 'border-white/10 text-disabled'
              )}
            >
              {data.me.ready ? t('duel ready') : t('duel not ready')}
            </span>
          ) : (
            pips(data.me.wins)
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {data.status === 'READY' && (
          <Button
            className="h-14 bg-success"
            loading={sending}
            disabled={data.me.ready}
            onClick={handleReady}
          >
            {data.me.ready ? t('duel waiting for opponent') : t('duel i am ready')}
          </Button>
        )}

        {playing && (
          <div className="grid grid-cols-3 gap-2">
            {MOVES.map(m => (
              <button
                key={m}
                type="button"
                disabled={sending || Boolean(data.me.move)}
                onClick={() => handleMove(m)}
                className={twMerge(
                  'flex-col-stretch h-24 items-center justify-center gap-1 rounded-2xl',
                  'border border-white/10 bg-background-overlay transition active:scale-95',
                  'disabled:opacity-40'
                )}
              >
                <DuelToken move={m} size={56} />
                <span className="text-[10px] tracking-wider text-disabled uppercase">
                  {t(MOVE_LABEL[m])}
                </span>
              </button>
            ))}
          </div>
        )}

        {(data.status === 'FINISHED' || data.status === 'CANCELLED') && (
          <Button variant="transparent" className="h-12" onClick={onLeave}>
            {t('duel back to lobbies')}
          </Button>
        )}
      </div>
    </div>
  );
}
