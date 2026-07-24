'use client';

import { useLocale } from 'next-intl';
import { useGetFaqArticleByIdQuery } from '@/api/faq.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { FaqArticleBody } from './FaqArticleBody';
import { getLocalizedText } from '@/utils/pages/faq.utils';

interface FaqArticleContainerProps {
  id: string;
}

export function FaqArticleContainer({ id }: FaqArticleContainerProps) {
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useGetFaqArticleByIdQuery(id);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <FaqArticleBody
      loading={isLoading}
      lead={data ? getLocalizedText(data.description, locale) : undefined}
      content={data ? getLocalizedText(data.content, locale) : undefined}
    />
  );
}
