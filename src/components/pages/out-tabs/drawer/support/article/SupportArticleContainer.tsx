'use client';

import { useGetSupportArticleByIdQuery } from '@/api/support.api';
import { Term } from '@/components/shared/term/Term';

interface SupportArticleContainerProps {
  id: string;
}

export function SupportArticleContainer({ id }: SupportArticleContainerProps) {
  const { data, isLoading } = useGetSupportArticleByIdQuery(id);

  return <Term loading={isLoading}>{data?.content}</Term>;
}
