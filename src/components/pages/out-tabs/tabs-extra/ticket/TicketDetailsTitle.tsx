'use client';

import type { HTMLAttributes } from 'react';
import { PageHeader } from '@/components/layout-elements/PageHeader';
import { useGetTicketByIdQuery } from '@/api/tickets.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';

const titleIdByType: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

interface TicketDetailsTitleProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function TicketDetailsTitle({ id, ...props }: TicketDetailsTitleProps) {
  const t = useAppTranslations();
  const { data, isLoading } = useGetTicketByIdQuery(id);

  return (
    <PageHeader
      {...props}
      title={
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="lg" className="mx-auto" />}
        >
          {data
            ? t('{tier} ticket', { tier: t(titleIdByType[data.ticketType]) })
            : t('ticket details')}
        </SkeletonSuspense>
      }
    />
  );
}
