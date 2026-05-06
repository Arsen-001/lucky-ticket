'use client';

import { twMerge } from 'tailwind-merge';
import { useGetTopTournamentsQuery } from '@/api/tournaments.api';
import { HomeUpcomingTournamentCard } from '@/components/pages/tabs/home/HomeUpcomingTournamentCard';
import { HomeSectionHeader } from '@/components/pages/tabs/home/HomeSectionHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

const SKELETON_TOURNAMENTS = new Array(4).fill({}) as Tournament[];

export function HomeUpcomingTournaments({ className }: ClassNameProps) {
  const t = useAppTranslations();
  const { data: tournaments, isLoading } = useGetTopTournamentsQuery();

  const items = isLoading || !tournaments?.length ? SKELETON_TOURNAMENTS : tournaments;

  if (!isLoading && !tournaments?.length) {
    return null;
  }

  return (
    <div className={twMerge('flex flex-col gap-3', className)}>
      <HomeSectionHeader
        title={t('upcoming tournaments')}
        actionLabel={t('see all')}
        actionHref={routes.tournaments.index}
      />
      <div className="scrollbar-hidden flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {items.map((tournament, index) => (
          <HomeUpcomingTournamentCard
            key={tournament.id ?? index}
            {...tournament}
            loading={isLoading}
            style={{ animationDelay: `${index * 50}ms` }}
            className="flex-shrink-0 snap-start animate-slide-in-bottom"
          />
        ))}
      </div>
    </div>
  );
}
