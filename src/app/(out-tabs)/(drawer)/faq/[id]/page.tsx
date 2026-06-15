import { FaqArticleContainer } from '@/components/pages/out-tabs/drawer/faq/article/FaqArticleContainer';

export default async function FaqArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FaqArticleContainer id={id} />;
}
