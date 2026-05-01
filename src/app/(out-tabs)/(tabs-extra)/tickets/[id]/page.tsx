import { TicketDetails } from '@/components/pages/out-tabs/tabs-extra/ticket/TicketDetails';

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <TicketDetails id={id} />;
}
