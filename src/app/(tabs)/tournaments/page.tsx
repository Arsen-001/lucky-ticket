'use client';
import { TournamentCard } from '@/components/pages/tabs/tournaments/TournamentCard';
import { useGetTournamentsQuery } from '@/api/tournaments.api';
import type { PersonalTournament } from '@/types/interfaces/tournaments.interfaces';

export default function TournamentPage() {
  const { data: tournamentsData, isLoading } = useGetTournamentsQuery();

  const placeholderTournaments = new Array<PersonalTournament>(20).fill({} as PersonalTournament);
  const tournaments =
    isLoading || !tournamentsData?.length ? placeholderTournaments : tournamentsData;

  return (
    <div className="p-5 grid grid-cols-2 gap-x-3 gap-y-4">
      {tournaments?.map((tournament, index) => (
        <TournamentCard
          key={index}
          loading={isLoading}
          {...tournament}
          className="animate-slide-in-bottom"
          style={{ animationDelay: `${index * 50}ms` }}
        />
      ))}
    </div>
  );
}
