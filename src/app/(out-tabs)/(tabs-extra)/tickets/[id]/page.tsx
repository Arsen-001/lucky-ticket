import { TicketInfo } from '@/components/pages/out-tabs/tabs-extra/ticket/TicketInfo';

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <TicketInfo id={id} />
    </>
  );
}
