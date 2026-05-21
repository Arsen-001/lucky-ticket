'use client';

import type { HTMLAttributes } from 'react';
import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { findEngineLocation } from '@/utils/global/ticket-engine.utils';
import { routes } from '@/constants/routes';

interface EngineDetailsTitleProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function EngineDetailsTitle({ id, ...props }: EngineDetailsTitleProps) {
  const t = useAppTranslations();
  const { data: tickets, isLoading } = useGetTicketsQuery();

  const location = findEngineLocation(tickets, id);

  return (
    <PageHeader
      {...props}
      backRoute={routes.tickets.index}
      title={
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className="mx-auto" />}
        >
          {location
            ? t('engine number', { number: location.indexInTier + 1 })
            : t('engine details')}
        </SkeletonSuspense>
      }
    />
  );
}
