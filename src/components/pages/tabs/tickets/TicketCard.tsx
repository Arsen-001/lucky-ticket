'use client';

import type { Ticket as TicketDataType, TicketType } from '@/types/types/ticket.types';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import Image from 'next/image';
import { icons } from '@/constants/icons';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';

export type TicketCardProps = TicketDataType & ClassNameProps & { loading?: boolean };

export function TicketCard({
  id,
  ticketType,
  className,
  loading,
  blocked,
  count,
}: TicketCardProps) {
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
    height: 70,
  };

  const titleId = titleIdByType?.[ticketType];

  return (
    <Link href={!loading ? routes.tickets.getById(id) : '#'}>
      <div
        className={twMerge(
          'w-full p-4 bg-purple-gradient card-outlined rounded-xl flex flex-col h-full',
          className
        )}
      >
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton className="h-20 w-full rounded-lg" />}
        >
          <div className="h-20 bg-white/8 rounded-lg flex items-center justify-center shrink-0">
            <div className={!blocked ? 'shine-[130px]' : undefined}>
              <TicketOverlap {...ticketImageProps} className="z-1" />
            </div>
          </div>
        </SkeletonSuspense>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton className="mt-2 h-5 w-3/4 mx-auto" />}
        >
          <h5 className="flex-center gap-2 text-center mt-2 text-sm">
            <div className=" font-semibold truncate">{titleId && t(titleId)}</div>
            {!!count ? (
              <span className="font-semibold text-pink-secondary">x{count}</span>
            ) : (
              <Image className="pb-0.5" height={14} src={icons.lock} alt="lock" />
            )}
          </h5>
        </SkeletonSuspense>
      </div>
    </Link>
  );
}
