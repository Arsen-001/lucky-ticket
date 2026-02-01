import { SupportArticleContainer } from '@/components/pages/out-tabs/drawer/support/article/SupportArticleContainer';

export default async function SupportArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SupportArticleContainer id={id} />;
}
