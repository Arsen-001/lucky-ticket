'use client';
import { useGetTournamentsQuery } from '@/api/tournaments.api';
import { useState } from 'react';
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

export default function TournamentPage() {
  const { data: tournamentsData, isLoading } = useGetTournamentsQuery();
  const [filter, setFilter] = useState<TournamentFilterType>('all');
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState<TournamentType[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('soonest');
  const [hasGuaranteedOnly, setHasGuaranteedOnly] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const activeFilterCount =
    selectedTypes.length + (hasGuaranteedOnly ? 1 : 0) + (sortBy !== 'soonest' ? 1 : 0);

  const handleReset = () => {
    setSelectedTypes([]);
    setSortBy('soonest');
    setHasGuaranteedOnly(false);
  };

  const filteredTournaments =
    tournamentsData
      ?.filter(tournament => {
        const matchesTab =
          searchValue ||
          filter === 'all' ||
          (filter === 'participated' && tournament.participated) ||
          (filter === 'top' && !tournament.participated);

        const matchesSearch = stringIncludes(tournament.name, searchValue);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(tournament.type);
        const matchesGuaranteed = !hasGuaranteedOnly || tournament.guaranteed > 0;

        return matchesTab && matchesSearch && matchesType && matchesGuaranteed;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'prize-pool':
            return b.prizePool - a.prizePool;
          case 'soonest':
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          case 'guaranteed':
            return b.guaranteed - a.guaranteed;
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
      />
      <div
        key={`tournaments-${filter}-${searchValue}-${selectedTypes.join()}-${sortBy}-${hasGuaranteedOnly}`}
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
        hasGuaranteedOnly={hasGuaranteedOnly}
        onGuaranteedChange={setHasGuaranteedOnly}
        onReset={handleReset}
      />
    </div>
  );
}
