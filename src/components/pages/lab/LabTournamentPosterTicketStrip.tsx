'use client';

import { LabTournamentPosterTicketCard } from './LabTournamentPosterTicketCard';
import { LabTournamentsHeading } from './LabTournamentsHeading';
import { byStartTime } from '@/utils/global/tournament.utils';
import { staggerMs } from '@/utils/global/animation.utils';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

export interface LabTournamentPosterTicketStripProps {
  tournaments: Tournament[];
}

/** Hybrid A+C on the same snap rail as the live strip: nearest start first, no autoplay. */
export function LabTournamentPosterTicketStrip({
  tournaments,
}: LabTournamentPosterTicketStripProps) {
  const items = byStartTime(tournaments);

  return (
    <div className="flex flex-col gap-2">
      <LabTournamentsHeading count={items.length} />

      <div className="scrollbar-hidden flex snap-x snap-mandatory scroll-ps-4 gap-2.5 overflow-x-auto px-4 pb-1">
        {items.map((tournament, index) => (
          <div
            key={tournament.id}
            className="animate-slide-in-bottom shrink-0 snap-start"
            style={{ animationDelay: `${staggerMs(index, 50)}ms` }}
          >
            <LabTournamentPosterTicketCard tournament={tournament} />
          </div>
        ))}
      </div>
    </div>
  );
}
