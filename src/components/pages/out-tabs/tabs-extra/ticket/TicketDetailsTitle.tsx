'use client';

import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useGetTicketByIdQuery } from '@/api/tickets.api';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { HTMLAttributes } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';

interface TicketDetailsHeaderProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function TicketDetailsTitle({ id, ...props }: TicketDetailsHeaderProps) {
  const { data, isLoading } = useGetTicketByIdQuery(id);
  const t = useAppTranslations();

  const titleIdByType: Record<TicketType, MessageIds> = {
    bronze: 'bronze',
    silver: 'silver',
    gold: 'golden',
    platinum: 'platinum',
    diamond: 'diamond',
  };

  return (
    <PageHeader
      {...props}
      title={
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className=" mx-auto" />}
        >
          {data ? t(titleIdByType[data.ticketType]) : ''}
        </SkeletonSuspense>
      }
    />
  );
}
