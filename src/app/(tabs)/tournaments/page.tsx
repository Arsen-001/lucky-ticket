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

export default function TournamentPage() {
  const { data: tournamentsData, isLoading } = useGetTournamentsQuery();
  const [filter, setFilter] = useState<TournamentFilterType>('all');
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredTournaments =
    tournamentsData?.filter(tournament => {
      const matchesTab =
        searchValue ||
        filter === 'all' ||
        (filter === 'participated' && tournament.participated) ||
        (filter === 'top' && !tournament.participated);

      const matchesSearch = stringIncludes(tournament.name, searchValue);

      return matchesTab && matchesSearch;
    }) || [];

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
      />

      <TournamentList
        tournaments={displayTournaments}
        isLoading={isLoading}
        filter={filter}
        searchValue={searchValue}
      />
    </div>
  );
}
