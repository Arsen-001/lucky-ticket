'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useGetTournamentByIdQuery } from '@/api/tournaments.api';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { routes } from '@/constants/routes';
import type { HTMLAttributes } from 'react';

interface TournamentDetailsHeaderProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function TournamentDetailsTitle({ id, ...props }: TournamentDetailsHeaderProps) {
  const { data, isLoading } = useGetTournamentByIdQuery(id);

  return (
    <PageHeader
      {...props}
      backRoute={routes.tournaments.index}
      title={
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className=" mx-auto" />}
        >
          {data?.name}
        </SkeletonSuspense>
      }
    />
  );
}
