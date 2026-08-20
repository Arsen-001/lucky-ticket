'use client';

import { useEffect, useState } from 'react';
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
import { useToast } from '@/hooks/useToast';
import { useGetDuelStateQuery, useMoveDuelMutation, useReadyDuelMutation } from '@/api/duel.api';
import { duelBeats } from '@/utils/global/duel.utils';
import type { DuelMove } from '@/types/interfaces/duel.interfaces';
import '@/styles/components/duel.css';

/** В бою состояние опрашивается часто: раунд длится считаные секунды. */
const POLL_FAST = 600;

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
  const [sending, setSending] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const { data } = useGetDuelStateQuery(duelId, { pollingInterval: POLL_FAST });
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

  // Своё лобби до прихода соперника — отдельная картина, а не пустая арена.
  if (data.status === 'WAITING') {
    return (
      <div className="flex h-full flex-col">
        <DuelGameHeader tickets={tickets} />
        <DuelWaiting
          duelId={duelId}
          openInvite={openInvite}
          stake={data.stake}
          seconds={data.waitingSeconds}
          onCancel={onLeave}
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

  const roundWon =
    revealed && data.round?.winner
      ? data.round.winner === (data.role === 'host' ? 'HOST' : 'GUEST')
      : null;
  const myState = roundWon === null ? 'idle' : roundWon ? 'win' : 'lose';
  const foeState = roundWon === null ? 'idle' : roundWon ? 'lose' : 'win';
  const beats = revealed ? duelBeats(data.me.move, data.foe.move) : null;

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
            {!data.me.move && (
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
              {data.me.move ? t('duel move accepted') : t('duel pick a token')}
            </span>
          </>
        )}
      </div>

      {/* ── моя сторона ── */}
      <div className="flex flex-1 flex-col items-center justify-end gap-2.5">
        <DuelToken
          move={data.me.move}
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
              loading={sending}
              disabled={data.me.ready}
              onClick={handleReady}
            >
              {data.me.ready ? t('duel waiting for opponent') : t('duel i am ready')}
            </Button>
          </>
        )}

        {playing && <DuelPicks chosen={data.me.move} disabled={sending} onPick={handleMove} />}

        {finished && (
          <Button className="h-14" onClick={onLeave}>
            {t('duel back to lobbies')}
          </Button>
        )}
      </div>
    </div>
  );
}
