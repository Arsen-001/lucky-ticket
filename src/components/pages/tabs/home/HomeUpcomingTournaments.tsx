'use client';

import { twMerge } from 'tailwind-merge';
import { useGetTopTournamentsQuery } from '@/api/tournaments.api';
import { HomeTournamentsHeading } from '@/components/pages/tabs/home/HomeTournamentsHeading';
import { HomeUpcomingTournamentCard } from '@/components/pages/tabs/home/HomeUpcomingTournamentCard';
import { staggerStyle } from '@/utils/global/animation.utils';
import { byStartTime } from '@/utils/global/tournament.utils';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

const SKELETON_TOURNAMENTS = new Array(4).fill({}) as Tournament[];

/**
 * The upcoming tournaments on Home, nearest start first.
 *
 * It was a Swiper that centred one 256×64 card and pulled the next one in every
 * two seconds: six of the seven tournaments were behind a 14-second wait, the
 * two neighbours the mask left visible were faded to ~6%, and the order was
 * whatever the query returned — Platinum in three hours ahead of a sponsor in
 * five. Now it is a plain snap rail: a ticket and a readable half on screen,
 * nothing moves unless the player moves it, and the only thing ticking is the
 * countdowns.
 */
export function HomeUpcomingTournaments({ className }: ClassNameProps) {
  const { data: tournaments, isLoading } = useGetTopTournamentsQuery();

  const items = isLoading || !tournaments?.length ? SKELETON_TOURNAMENTS : byStartTime(tournaments);

  if (!isLoading && !tournaments?.length) {
    return null;
  }

  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      <HomeTournamentsHeading count={isLoading ? undefined : tournaments?.length} />

      <div className="scrollbar-hidden flex snap-x snap-mandatory scroll-pl-4 gap-2.5 overflow-x-auto px-4 py-[6px]">
        {items.map((tournament, index) => (
          <div
            key={tournament.id ?? index}
            className="animate-slide-in-bottom shrink-0 snap-start"
            style={staggerStyle(index, 50)}
          >
            <HomeUpcomingTournamentCard {...tournament} loading={isLoading} />
          </div>
        ))}
      </div>
    </div>
  );
}
