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
    <div className="min-h-full flex-col-stretch inset-container-background p-5">
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {tournaments?.map((tournament, index) => (
          <TournamentCard key={tournament.id || index} loading={isLoading} {...tournament} />
        ))}
      </div>
    </div>
  );
}
