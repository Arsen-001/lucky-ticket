'use client';

import { useLocale } from 'next-intl';
import { useGetFaqArticleByIdQuery } from '@/api/faq.api';
import { PageDisabledState } from '@/components/shared/error/PageDisabledState';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { useContentPagesEnabled } from '@/hooks/useContentPagesEnabled';
import { FaqArticleBody } from './FaqArticleBody';
import { getLocalizedText } from '@/utils/pages/faq.utils';

interface FaqArticleContainerProps {
  id: string;
}

export function FaqArticleContainer({ id }: FaqArticleContainerProps) {
  const locale = useLocale();
  // Article deep links outlive the switch — a notification or a shared link can
  // land here long after the FAQ was taken down.
  const { faq: enabled } = useContentPagesEnabled();
  const { data, isLoading, isError, refetch } = useGetFaqArticleByIdQuery(id, { skip: !enabled });

  if (!enabled) return <PageDisabledState />;
  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <FaqArticleBody
      loading={isLoading}
      lead={data ? getLocalizedText(data.description, locale) : undefined}
      content={data ? getLocalizedText(data.content, locale) : undefined}
    />
  );
}
