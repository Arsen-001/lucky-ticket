'use client';
import type { Ticket as TicketDataType, TicketType } from '@/types/types/ticket.types';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import Image from 'next/image';
import { icons } from '@/constants/icons';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import Link from 'next/link';
import { routes } from '@/constants/routes';

export type TicketListItemProps = TicketDataType & ClassNameProps & { loading?: boolean };

export function TicketListItem({
  id,
  ticketType,
  className,
  loading,
  blocked,
  count,
}: TicketListItemProps) {
  const t = useAppTranslations();

  const titleIdByType: Record<TicketType, MessageIds> = {
    bronze: 'bronze',
    silver: 'silver',
    gold: 'golden',
    platinum: 'platinum',
    diamond: 'diamond',
  };

  const ticketImageProps = {
    type: ticketType,
    width: 70,
    height: 42,
  };

  if (loading) {
    return (
      <div
        className={twMerge(
          'bg-purple-gradient rounded-lg flex items-center gap-2 p-2 overflow-hidden',
          className
        )}
      >
        <Ticket loading {...ticketImageProps} />
        <div className="flex flex-col flex-1 gap-2">
          <div className="flex flex-col-stretch gap-1 overflow-hidden">
            <Skeleton className="w-20" variant={'line'} textSize="sm" />
            <Skeleton variant={'line'} className="h-4 w-18 " />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={routes.tickets.getById(id)}
      className={twMerge(
        'bg-purple-gradient rounded-lg flex items-center gap-2 p-2 overflow-hidden',
        className
      )}
    >
      <Ticket {...ticketImageProps} />
      <div className="flex flex-col flex-1 gap-1 overflow-hidden">
        <span className="text-sm font-semibold">{t(titleIdByType[ticketType])}</span>
        {!!count && <span className="text-xs text-pink-secondary">x{count}</span>}
      </div>
      {blocked && <Image className="mr-5" height={32} src={icons.lock} alt="lock" />}
    </Link>
  );
}
