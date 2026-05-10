import { EngineDetailsTitle } from '@/components/pages/out-tabs/tabs-extra/engine/EngineDetailsTitle';

export default async function EngineDetailsHeader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EngineDetailsTitle id={id} />;
}
