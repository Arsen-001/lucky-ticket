import { PartnerTournamentDetail } from '@/components/pages/out-tabs/drawer/partners/detail/PartnerTournamentDetail';

interface PartnerTournamentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PartnerTournamentDetailPage({
  params,
}: PartnerTournamentDetailPageProps) {
  const { id } = await params;
  return <PartnerTournamentDetail id={id} />;
}
