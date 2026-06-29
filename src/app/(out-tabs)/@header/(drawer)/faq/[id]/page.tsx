import { FaqArticleTitle } from '@/components/pages/out-tabs/drawer/faq/article/FaqArticleTitle';

export default async function FaqArticleHeader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FaqArticleTitle id={id} />;
}
