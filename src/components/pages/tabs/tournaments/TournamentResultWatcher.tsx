'use client';

import { useEffect, useRef, useState } from 'react';
import { useGetTournamentsQuery, useMarkTournamentResultSeenMutation } from '@/api/tournaments.api';
import { TournamentResultModal } from '@/components/pages/out-tabs/tabs-extra/tournament/TournamentResultModal';
import { useAutoSurfaceSlot } from '@/hooks/useAutoSurfaceSlot';
import type { PersonalTournament } from '@/types/interfaces/tournaments.interfaces';

/**
 * Пауза между двумя результатами: 200мс уходит на анимацию закрытия самой
 * модалки (`Modal`), остаток — чтобы следующая карточка прочиталась как
 * СЛЕДУЮЩАЯ, а не как перерисовка текущей.
 *
 * @see Modal — ANIMATION_MS
 */
const QUEUE_GAP_MS = 420;

/**
 * Показываемый прямо сейчас результат — СНИМОК, а не ссылка в список.
 *
 * Пока модалка закрывается, `markSeen` уже улетел и рефетч списка вот-вот
 * унесёт этот турнир из выдачи; читая его из списка, модалка на 200мс анимации
 * осталась бы без данных. Позиция и размер очереди тоже фиксируются здесь: они
 * посчитаны в момент открытия и не должны прыгать («1 / 3» → «2 / 2») пока
 * карточка уезжает.
 */
interface ShownResult {
  tournament: PersonalTournament;
  position: number;
  total: number;
}

/**
 * App-wide result popup: whenever the user has a finished tournament they joined
 * with an unseen result, it auto-opens the result modal — no matter which screen
 * they're on, or if they were already in the app when it finished (DOCS §11.7).
 *
 * Результатов бывает несколько — игрок участвовал в трёх турнирах и зашёл после
 * всех трёх. Они идут ОЧЕРЕДЬЮ: модалка закрывается, и через паузу открывается
 * следующая. До 23.08.2026 закрытие лишь подменяло содержимое открытого диалога
 * — награды второго турнира появлялись поверх первого без единого кадра
 * закрытия, и это читалось как «цифры сами переписались», а не «вот второй
 * результат».
 */
export function TournamentResultWatcher() {
  const { data: tournaments } = useGetTournamentsQuery();
  const [markSeen] = useMarkTournamentResultSeenMutation();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [shown, setShown] = useState<ShownResult | null>(null);
  const [open, setOpen] = useState(false);
  /** Сколько результатов уже пролистали в этой цепочке — для подписи «2 из 3». */
  const doneRef = useRef(0);
  const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queue = (tournaments ?? []).filter(
    t =>
      t.status === 'finished' &&
      t.participated &&
      !!t.userResult &&
      !t.resultSeen &&
      !dismissed.includes(t.id)
  );

  // Outranks the notification popup — a won tournament is the better welcome.
  // Слот держим и пока показываем снимок: очередь уже пуста, а диалог ещё на
  // экране, и отпустить слот здесь значит впустить следующий попап под него.
  const canShow = useAutoSurfaceSlot('tournament-result', queue.length > 0 || !!shown);

  useEffect(() => {
    if (shown || !canShow || !queue.length) return;
    setShown({
      tournament: queue[0],
      position: doneRef.current + 1,
      total: doneRef.current + queue.length,
    });
    setOpen(true);
  }, [canShow, shown, queue.length, queue[0]?.id]);

  // Цепочка кончилась — следующий заход считается заново, с «1 из N».
  useEffect(() => {
    if (!shown && !queue.length) doneRef.current = 0;
  }, [shown, queue.length]);

  useEffect(
    () => () => {
      if (gapTimer.current) clearTimeout(gapTimer.current);
    },
    []
  );

  const handleClose = () => {
    if (!shown) return;
    // Fire-and-forget optimistic mark (no unwrap) — the watcher hides it locally
    // via `dismissed` immediately so it can't re-trigger before the refetch.
    markSeen({ tournamentId: shown.tournament.id });
    setDismissed(prev => [...prev, shown.tournament.id]);
    doneRef.current += 1;
    setOpen(false);
    // Снимок отпускаем только когда диалог доиграл закрытие: до этого он —
    // единственный источник данных для уезжающей карточки.
    if (gapTimer.current) clearTimeout(gapTimer.current);
    gapTimer.current = setTimeout(() => setShown(null), QUEUE_GAP_MS);
  };

  const current = shown?.tournament;

  return (
    <TournamentResultModal
      open={open}
      onClose={handleClose}
      tournamentId={current?.id}
      tournamentName={current?.name ?? ''}
      tournamentType={current?.type ?? 'bronze'}
      shardType={current?.shardType}
      result={current?.userResult}
      total={current?.participantsCount}
      places={current?.places}
      queuePosition={shown?.position}
      queueTotal={shown?.total}
    />
  );
}
