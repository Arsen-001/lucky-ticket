'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useGetSupportArticleByIdQuery } from '@/api/support.api';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { HTMLAttributes } from 'react';

interface SupportArticleTitleProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function SupportArticleTitle({ id, ...props }: SupportArticleTitleProps) {
  const { data, isLoading } = useGetSupportArticleByIdQuery(id);

  return (
    <PageHeader
      {...props}
      title={
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className="mx-auto" />}
        >
          {data?.title}
        </SkeletonSuspense>
      }
    />
  );
}
