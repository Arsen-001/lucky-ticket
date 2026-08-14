'use client';

import { LabTournamentPosterCard } from './LabTournamentPosterCard';
import { LabTournamentsHeading } from './LabTournamentsHeading';
import { byStartTime } from '@/utils/global/tournament.utils';
import { staggerMs } from '@/utils/global/animation.utils';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

export interface LabTournamentPosterStripProps {
  tournaments: Tournament[];
}

/**
 * Option A — posters on a snap rail, nearest start first, no autoplay.
 *
 * The rail is a plain scroller rather than Swiper: nothing moves unless the
 * player moves it, so the countdowns are the only thing ticking on Home.
 */
export function LabTournamentPosterStrip({ tournaments }: LabTournamentPosterStripProps) {
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
            <LabTournamentPosterCard tournament={tournament} />
          </div>
        ))}
      </div>
    </div>
  );
}
