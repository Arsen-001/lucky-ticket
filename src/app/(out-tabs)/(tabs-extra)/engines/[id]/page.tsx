import { EngineDetails } from '@/components/pages/out-tabs/tabs-extra/engine/EngineDetails';

export default async function EngineDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <EngineDetails id={id} />;
}
