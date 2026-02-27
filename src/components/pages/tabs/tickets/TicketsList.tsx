'use client';
import { TicketCard } from '@/components/pages/tabs/tickets/TicketCard';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';

export function TicketsList({ className }: ClassNameProps) {
  const { data: ticketsData, isFetching } = useGetTicketsQuery();
  const tickets = isFetching ? new Array(6).fill({}) : ticketsData;
  return (
    <div className={twMerge('grid grid-cols-2 gap-x-3 gap-y-4 content-start', className)}>
      {tickets?.map((ticket, index) => {
        return <TicketCard loading={isFetching} key={ticket?.id || index} {...ticket} />;
      })}
    </div>
  );
}
