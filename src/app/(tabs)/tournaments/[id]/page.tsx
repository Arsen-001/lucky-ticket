import { TournamentDetails } from '@/components/pages/tabs/tournaments/TournamentDetails';

export default async function TournamentByIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <TournamentDetails id={id} />;
}
