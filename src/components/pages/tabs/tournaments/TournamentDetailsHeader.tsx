'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { useGetTournamentByIdQuery } from '@/api/tournaments.api';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { HTMLAttributes } from 'react';

interface TournamentDetailsHeaderProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function TournamentDetailsHeader({ id, ...props }: TournamentDetailsHeaderProps) {
  const { data, isLoading } = useGetTournamentByIdQuery(id);

  return (
    <PageHeader
      {...props}
      title={
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="title" textSize="lg" className=" mx-auto" />}
        >
          {data?.name}
        </SkeletonSuspense>
      }
    />
  );
}
