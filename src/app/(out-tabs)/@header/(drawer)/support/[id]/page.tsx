import { SupportArticleTitle } from '@/components/pages/out-tabs/drawer/support/article/SupportArticleTitle';

export default async function SupportArticleHeader({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupportArticleTitle id={id} />;
}
