'use client';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { HomeTickestListItem } from '@/components/pages/tabs/home/HomeTickestListItem';

export function HomeTicketsList({ className }: ClassNameProps) {
  const { data: ticketsData, isFetching } = useGetTicketsQuery();
  const tickets = isFetching ? new Array(5).fill({}) : ticketsData;
  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      {tickets?.map((ticket, index) => {
        return <HomeTickestListItem loading={isFetching} key={ticket?.id || index} {...ticket} />;
      })}
    </div>
  );
}
