'use client';

import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { DuelHand } from '@/components/pages/out-tabs/tabs-extra/duel/DuelHand';
import { DuelPicks } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPicks';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';
import { DuelSideCard } from '@/components/pages/out-tabs/tabs-extra/duel/DuelSideCard';
import { DuelStakeBadge } from '@/components/pages/out-tabs/tabs-extra/duel/DuelStakeBadge';
import { DuelToken } from '@/components/pages/out-tabs/tabs-extra/duel/DuelToken';
import { DuelWaiting } from '@/components/pages/out-tabs/tabs-extra/duel/DuelWaiting';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useGetDuelStateQuery, useMoveDuelMutation, useReadyDuelMutation } from '@/api/duel.api';
import type { DuelMove } from '@/types/interfaces/duel.interfaces';
import '@/styles/components/duel.css';

/** В бою состояние опрашивается часто, в ожидании — редко. */
const POLL_FAST = 600;

export interface DuelArenaProps {
  duelId: string;
  onLeave: () => void;
}

/**
 * Арена: ожидание соперника, готовность и сам матч — одним экраном.
 *
 * Отдельного экрана подтверждения нет намеренно: арена уже на месте, соперник
 * сверху, вы снизу, а внизу вместо трёх жетонов одна кнопка «Я готов». Шаг не
 * читается как лишний, потому что ничего не переключается — меняется только
 * то, что лежит под руками.
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
  const waiting = data?.status === 'WAITING';

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

  // Своё лобби до прихода соперника — отдельная картина, а не пустая арена.
  if (waiting) {
    return <DuelWaiting stake={data.stake} seconds={data.waitingSeconds} onCancel={onLeave} />;
  }

  const foeName = data.opponent?.name ?? t('duel waiting for opponent');

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

  // ── фаза готовности ────────────────────────────────────────────────
  if (data.status === 'READY') {
    const left = secondsLeft(data.readyDeadline);
    return (
      <div className="flex min-h-full flex-col gap-3">
        <div className="flex items-stretch gap-2.5">
          <DuelSideCard
            name={foeName}
            avatarUrl={data.opponent?.avatarUrl || undefined}
            ready={data.foe.ready}
          />
          <span className="text-disabled flex items-center text-xs font-extrabold">VS</span>
          <DuelSideCard name={t('duel you')} ready={data.me.ready} />
        </div>

        <div className="flex flex-col items-center gap-1.5 py-1">
          <span className="text-gold text-[34px] leading-none font-extrabold tabular-nums">
            {left}
          </span>
          <span className="text-disabled text-xs">{t('duel both must confirm')}</span>
          <span className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <span
              className="bg-pink-gradient block h-full origin-left transition-transform duration-500"
              style={{ transform: `scaleX(${Math.max(0, Math.min(1, left / 10))})` }}
            />
          </span>
        </div>

        <DuelStakeBadge stake={data.stake} className="self-center" />

        {/* Рубашки на столе: арена уже стоит, меняется только то, что под рукой. */}
        <div className="flex flex-1 items-center justify-center gap-6 py-2">
          <DuelToken move={null} size={92} />
          <DuelToken move={null} size={92} />
        </div>

        <Button
          className="mt-auto h-14 bg-success"
          loading={sending}
          disabled={data.me.ready}
          onClick={handleReady}
        >
          {data.me.ready ? t('duel waiting for opponent') : t('duel i am ready')}
        </Button>
      </div>
    );
  }

  // ── матч и его итог ───────────────────────────────────────────────
  const finished = data.status === 'FINISHED';
  const iWon = data.winner === (data.role === 'host' ? 'HOST' : 'GUEST');

  return (
    <div className="flex min-h-full flex-col">
      {/* соперник сверху */}
      <div className="flex flex-1 flex-col items-center justify-start gap-2 pt-1">
        <div className="flex items-center gap-2">
          <DuelPlayerAvatar
            name={foeName}
            avatarUrl={data.opponent?.avatarUrl || undefined}
            size={30}
          />
          <span className="text-gray-secondary text-[12.5px] font-semibold">{foeName}</span>
          {pips(data.foe.wins)}
          {playing && data.foe.moved && !revealed && (
            <span className="border-gold/45 bg-gold/10 text-gold rounded-full border px-2 py-0.5 text-[10px] font-black tracking-wider uppercase">
              {t('duel moved')}
            </span>
          )}
        </div>
        <DuelToken
          move={revealed ? data.foe.move : null}
          size={110}
          state={foeState}
          className={revealed ? 'duel-drop' : ''}
        />

        {playing && (
          <DuelHand
            className="w-full px-1"
            thinking={!data.foe.moved && !revealed}
            revealed={revealed ? data.foe.move : null}
          />
        )}
      </div>

      {/* середина: исход раунда или что сейчас делать */}
      <div className="flex min-h-[66px] flex-col items-center justify-center gap-0.5 border-y border-white/6 py-2 text-center">
        {finished ? (
          <>
            <span
              className={twMerge(
                'text-[19px] font-extrabold',
                iWon ? 'text-gold' : 'text-error-text'
              )}
            >
              {iWon ? t('duel you won') : t('duel you lost')}
            </span>
            <span className="text-pink-secondary text-[11px]">
              {t('duel stake short')} {data.stake * 2}
            </span>
          </>
        ) : (
          <>
            {!revealed && !data.me.move && (
              <span
                className={twMerge(
                  'text-2xl font-extrabold tabular-nums',
                  secondsLeft(data.round?.deadline ?? null) <= 2 ? 'text-error-text' : 'text-gold'
                )}
              >
                {secondsLeft(data.round?.deadline ?? null)}
              </span>
            )}
            <span
              className={twMerge(
                'text-xs',
                revealed && myState === 'win' && 'text-gold font-bold',
                revealed && myState === 'lose' && 'text-error-text font-bold',
                !revealed && 'text-gray-secondary'
              )}
            >
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
          </>
        )}
      </div>

      {/* моя сторона снизу */}
      <div className="flex flex-1 flex-col items-center justify-end gap-2">
        <DuelToken
          move={data.me.move}
          size={124}
          state={myState}
          className={revealed ? 'duel-drop' : ''}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{t('duel you')}</span>
          {pips(data.me.wins)}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {playing ? (
          <DuelPicks chosen={data.me.move} disabled={sending} onPick={handleMove} />
        ) : (
          <Button className="h-14" onClick={onLeave}>
            {t('duel back to lobbies')}
          </Button>
        )}
      </div>
    </div>
  );
}
