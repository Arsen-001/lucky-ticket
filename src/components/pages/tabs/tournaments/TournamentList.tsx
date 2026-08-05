'use client';

import type { TournamentCardProps } from './TournamentCard';
import { TournamentCard } from './TournamentCard';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerMs } from '@/utils/global/animation.utils';

interface TournamentListProps {
  tournaments: TournamentCardProps[];
  isLoading: boolean;
  /** Tab-aware empty-state copy; falls back to the generic "not found" text. */
  emptyTitle?: string;
  emptyDescription?: string;
}

export function TournamentList({
  tournaments,
  isLoading,
  emptyTitle,
  emptyDescription,
}: TournamentListProps) {
  const t = useAppTranslations();

  return (
    <div className="py-5 flex flex-col gap-3">
      {tournaments.map((tournament, index) =>
        index === 0 ? (
          // Stateful cards (modals, countdown) must be keyed by identity, not
          // position — a refetch that reorders the list would otherwise
          // re-attach state to the wrong tournament.
          // The tour anchor only goes on a *loaded* card: skeleton placeholders
          // remount (key index → id) when data lands, and a tour locked onto the
          // skeleton would flicker as the entry animation replays under it.
          <div key={tournament.id ?? index} data-tour={isLoading ? undefined : 'tournaments'}>
            <TournamentCard
              loading={isLoading}
              {...tournament}
              tourJoinAnchor
              style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
            />
          </div>
        ) : (
          <TournamentCard
            key={tournament.id ?? index}
            loading={isLoading}
            {...tournament}
            style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
          />
        )
      )}
      {!isLoading && tournaments.length === 0 && (
        <EmptyDataInfo
          className="py-10"
          title={emptyTitle ?? t('tournaments not found')}
          description={emptyDescription ?? t('no results description')}
        />
      )}
    </div>
  );
}
