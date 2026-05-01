import { ProgressStakeContent } from '@/components/pages/out-tabs/drawer/stakes/progress/ProgressStakeContent';

interface ProgressStakePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgressStakePage({ params }: ProgressStakePageProps) {
  const { id } = await params;
  return <ProgressStakeContent stakeId={id} />;
}
