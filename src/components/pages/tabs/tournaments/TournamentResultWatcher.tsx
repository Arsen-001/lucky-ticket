'use client';

import { useState } from 'react';
import { useGetTournamentsQuery, useMarkTournamentResultSeenMutation } from '@/api/tournaments.api';
import { TournamentResultModal } from '@/components/pages/out-tabs/tabs-extra/tournament/TournamentResultModal';
import { useAutoSurfaceSlot } from '@/hooks/useAutoSurfaceSlot';

/**
 * App-wide result popup: whenever the user has a finished tournament they joined
 * with an unseen result, it auto-opens the result modal — no matter which screen
 * they're on, or if they were already in the app when it finished (DOCS §11.7).
 * Closing marks it seen and advances to the next unseen result.
 */
export function TournamentResultWatcher() {
  const { data: tournaments } = useGetTournamentsQuery();
  const [markSeen] = useMarkTournamentResultSeenMutation();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const pending = tournaments?.find(
    t =>
      t.status === 'finished' &&
      t.participated &&
      !!t.userResult &&
      !t.resultSeen &&
      !dismissed.has(t.id)
  );

  // Outranks the notification popup — a won tournament is the better welcome.
  const canShow = useAutoSurfaceSlot('tournament-result', !!pending);

  const handleClose = () => {
    if (!pending) return;
    // Fire-and-forget optimistic mark (no unwrap) — the watcher hides it locally
    // via `dismissed` immediately so it can't re-trigger before the refetch.
    markSeen({ tournamentId: pending.id });
    setDismissed(s => new Set(s).add(pending.id));
  };

  return (
    <TournamentResultModal
      open={canShow}
      onClose={handleClose}
      tournamentId={pending?.id}
      tournamentName={pending?.name ?? ''}
      tournamentType={pending?.type ?? 'bronze'}
      shardType={pending?.shardType}
      result={pending?.userResult}
      total={pending?.participantsCount}
      places={pending?.places}
    />
  );
}
