import { TournamentDetailsTitle } from '@/components/pages/out-tabs/tabs-extra/tournament/TournamentDetailsTitle';

export default async function TournamentDetailsHeader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TournamentDetailsTitle id={id} />;
}
