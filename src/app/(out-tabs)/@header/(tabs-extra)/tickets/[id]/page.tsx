import { TicketDetailsTitle } from '@/components/pages/out-tabs/tabs-extra/ticket/TicketDetailsTitle';

export default async function TicketDetailsHeader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketDetailsTitle id={id} />;
}
