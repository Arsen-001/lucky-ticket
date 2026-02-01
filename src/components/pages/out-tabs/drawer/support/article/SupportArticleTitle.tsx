'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useGetSupportArticleByIdQuery } from '@/api/support.api';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { HTMLAttributes } from 'react';
import { CopyButton } from '@/components/shared/buttons/CopyButton';

interface SupportArticleTitleProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function SupportArticleTitle({ id, ...props }: SupportArticleTitleProps) {
  const { data, isLoading } = useGetSupportArticleByIdQuery(id);

  return (
    <PageHeader
      {...props}
      extra={
        //TODO: handle copy action
        <CopyButton
          loading={isLoading}
          value={'Some Text'}
          variant="secondary"
          className="flex-center gap-1 p-2.5 text-sm"
        />
      }
      title={
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className="w-42 mx-auto" />}
        >
          {data?.title}
        </SkeletonSuspense>
      }
    />
  );
}
