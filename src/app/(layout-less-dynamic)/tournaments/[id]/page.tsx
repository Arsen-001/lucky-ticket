import { TournamentInfo } from '@/components/pages/tabs/tournaments/TournamentInfo';
import { TournamentDetailsHeader } from '@/components/pages/tabs/tournaments/TournamentDetailsHeader';
import { TournamentPlacements } from '@/components/pages/tabs/tournaments/TournamentPlacements';

export default async function TournamentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="h-full w-full flex-col-stretch overflow-hidden">
      <TournamentDetailsHeader id={id} />
      <div className="flex-available inset-container-background overflow-hidden flex-col-stretch">
        <div className="pt-3 px-5 pb-10 flex-available overflow-auto scrollbar-hidden">
          <TournamentInfo id={id} />
          <TournamentPlacements id={id} />
        </div>
      </div>
    </div>
  );
}
