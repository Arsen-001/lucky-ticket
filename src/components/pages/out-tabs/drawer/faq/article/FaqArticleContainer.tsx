'use client';

import { useLocale } from 'next-intl';
import { useGetFaqArticleByIdQuery } from '@/api/faq.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { Term } from '@/components/shared/term/Term';
import { getLocalizedText } from '@/utils/pages/faq.utils';

interface FaqArticleContainerProps {
  id: string;
}

export function FaqArticleContainer({ id }: FaqArticleContainerProps) {
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useGetFaqArticleByIdQuery(id);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <Term loading={isLoading}>{data ? getLocalizedText(data.content, locale) : undefined}</Term>
  );
}
