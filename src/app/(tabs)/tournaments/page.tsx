'use client';
import { useGetTournamentsQuery } from '@/api/tournaments.api';
import { useMemo, useState } from 'react';
import { stringIncludes } from '@/utils/global/string.utils';
import {
  TournamentFilters,
  type TournamentFilterType,
} from '@/components/pages/tabs/tournaments/TournamentFilters';
import { TournamentList } from '@/components/pages/tabs/tournaments/TournamentList';
import type { TournamentCardProps } from '@/components/pages/tabs/tournaments/TournamentCard';
import {
  TournamentFilterSheet,
  type SortOption,
} from '@/components/pages/tabs/tournaments/TournamentFilterSheet';
import type { TournamentType } from '@/types/types/tournaments.types';
import type { PersonalTournament } from '@/types/interfaces/tournaments.interfaces';

const matchesTab = (tournament: PersonalTournament, filter: TournamentFilterType): boolean => {
  switch (filter) {
    case 'all':
      return tournament.status === 'upcoming';
    case 'top':
      return tournament.status === 'upcoming' && !tournament.participated;
    case 'participated':
      return tournament.status === 'upcoming' && tournament.participated;
    case 'history':
      return tournament.status === 'finished' && tournament.participated;
    default:
      return true;
  }
};

export default function TournamentPage() {
  const { data: tournamentsData, isLoading } = useGetTournamentsQuery();
  const [filter, setFilter] = useState<TournamentFilterType>('all');
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState<TournamentType[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('soonest');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const activeFilterCount = selectedTypes.length + (sortBy !== 'soonest' ? 1 : 0);

  const handleReset = () => {
    setSelectedTypes([]);
    setSortBy('soonest');
  };

  const tabCounts = useMemo(() => {
    const counts: Record<TournamentFilterType, number> = {
      all: 0,
      top: 0,
      participated: 0,
      history: 0,
    };
    tournamentsData?.forEach(tour => {
      (Object.keys(counts) as TournamentFilterType[]).forEach(key => {
        if (matchesTab(tour, key)) counts[key] += 1;
      });
    });
    return counts;
  }, [tournamentsData]);

  const tabs = useMemo(
    () =>
      (['all', 'top', 'participated', 'history'] as const).map(key => ({
        key,
        count: tabCounts[key],
      })),
    [tabCounts]
  );

  const filteredTournaments =
    tournamentsData
      ?.filter(tournament => {
        const tabPasses = searchValue ? true : matchesTab(tournament, filter);
        const matchesSearch = stringIncludes(tournament.name, searchValue);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(tournament.type);

        return tabPasses && matchesSearch && matchesType;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'prize-pool':
            return b.prizePool - a.prizePool;
          case 'soonest':
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          case 'team-size':
            return a.teamSize - b.teamSize;
          default:
            return 0;
        }
      }) ?? [];

  const placeholderTournaments = new Array(10).fill({}) as TournamentCardProps[];
  const displayTournaments = isLoading ? placeholderTournaments : filteredTournaments;

  return (
    <div className="flex flex-col min-h-full p-5">
      <TournamentFilters
        filter={filter}
        onFilterChange={setFilter}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        activeFilterCount={activeFilterCount}
        onFilterSheetOpen={() => setIsFilterSheetOpen(true)}
        tabs={tabs}
      />
      <div
        key={`tournaments-${filter}-${searchValue}-${selectedTypes.join()}-${sortBy}`}
        className="animate-slide-in-bottom"
      >
        <TournamentList tournaments={displayTournaments} isLoading={isLoading} />
      </div>
      <TournamentFilterSheet
        open={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleReset}
      />
    </div>
  );
}
