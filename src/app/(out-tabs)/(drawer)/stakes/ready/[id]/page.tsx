import { ReadyStakeContent } from '@/components/pages/out-tabs/drawer/stakes/ready/ReadyStakeContent';

interface ReadyStakePageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadyStakePage({ params }: ReadyStakePageProps) {
  const { id } = await params;
  return <ReadyStakeContent stakeId={id} />;
}
