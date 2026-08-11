'use client';

import { LabTournamentTicketCard } from './LabTournamentTicketCard';
import { LabTournamentsHeading } from './LabTournamentsHeading';
import { byStartTime } from './labTournamentTier.utils';
import { staggerMs } from '@/utils/global/animation.utils';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

export interface LabTournamentTicketStripProps {
  tournaments: Tournament[];
}

/**
 * Option C's rail. One and a half tickets fit, which is the cheapest possible
 * "there is more to the right" — and the half is a readable half, because the
 * stub is on the left: the neighbour shows its tier and its name, not a sliced
 * countdown like the current fade does.
 */
export function LabTournamentTicketStrip({ tournaments }: LabTournamentTicketStripProps) {
  const items = byStartTime(tournaments);

  return (
    <div className="flex flex-col gap-2">
      <LabTournamentsHeading count={items.length} />

      <div className="scrollbar-hidden flex snap-x snap-mandatory scroll-pl-4 gap-2.5 overflow-x-auto px-4 pb-1">
        {items.map((tournament, index) => (
          <div
            key={tournament.id}
            className="animate-slide-in-bottom shrink-0 snap-start"
            style={{ animationDelay: `${staggerMs(index, 50)}ms` }}
          >
            <LabTournamentTicketCard tournament={tournament} />
          </div>
        ))}
      </div>
    </div>
  );
}
