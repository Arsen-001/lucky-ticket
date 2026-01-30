import { TournamentInfo } from '@/components/pages/out-tabs/tabs-extra/tournament/TournamentInfo';
import { TournamentPlacements } from '@/components/pages/out-tabs/tabs-extra/tournament/TournamentPlacements';

export default async function TournamentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <TournamentInfo id={id} />
      <TournamentPlacements id={id} />
    </>
  );
}
