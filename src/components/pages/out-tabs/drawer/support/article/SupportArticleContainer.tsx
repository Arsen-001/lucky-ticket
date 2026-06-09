'use client';

import { useGetSupportArticleByIdQuery } from '@/api/support.api';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { Term } from '@/components/shared/term/Term';

interface SupportArticleContainerProps {
  id: string;
}

export function SupportArticleContainer({ id }: SupportArticleContainerProps) {
  const { data, isLoading, isError, refetch } = useGetSupportArticleByIdQuery(id);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return <Term loading={isLoading}>{data?.content}</Term>;
}
