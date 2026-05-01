'use client';

import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Progress } from '@/components/shared/Progress';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { icons } from '@/constants/icons';
import type { Ticket, TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';

export type LockedTicketCardProps = Ticket & ClassNameProps & { loading?: boolean };

const titleIdByType: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

export function LockedTicketCard({
  id,
  ticketType,
  requirements,
  loading,
  className,
}: LockedTicketCardProps) {
  const t = useAppTranslations();

  const reqCount = requirements?.length ?? 0;
  const overall = requirements?.length
    ? requirements.reduce(
        (sum, req) => sum + Math.min(1, (req.actualCount || 0) / (req.totalCount || 1)),
        0
      ) / requirements.length
    : 0;
  const overallPct = Math.round(overall * 100);

  const inner = (
    <div
      className={twMerge(
        'card-outlined bg-purple-gradient rounded-xl p-3 relative flex flex-col',
        'transition-transform duration-100 active:scale-[0.99]',
        className
      )}
    >
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton className="h-18.5 w-full rounded-xl" />}
      >
        <div className="h-18.5 rounded-xl flex-center relative">
          <TicketOverlap type={ticketType} width={80} height={70} />
          <Image src={icons.lock} alt="lock" height={22} className="absolute bottom-1 right-1.5" />
        </div>
      </SkeletonSuspense>

      <div className="mt-2.5 flex items-center justify-between">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton className="h-4 w-16" variant="line" />}
        >
          <span className="text-sm font-extrabold text-white">{t(titleIdByType[ticketType])}</span>
        </SkeletonSuspense>
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton className="h-3 w-8" variant="line" />}
        >
          <span className="text-[10px] font-bold text-pink-secondary tabular-nums">
            {overallPct}%
          </span>
        </SkeletonSuspense>
      </div>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton className="mt-1.5 h-1 w-full" variant="line" />}
      >
        <Progress className="mt-1.5 h-1" percentage={overallPct} />
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton className="mt-2 h-2.5 w-20" variant="line" />}
      >
        <div className="mt-2 text-[10px] font-semibold text-pink-secondary">
          {reqCount === 1 ? t('1 requirement') : t('{count} requirements', { count: reqCount })}
        </div>
      </SkeletonSuspense>
    </div>
  );

  if (loading) return inner;

  return <Link href={routes.tickets.getById(id)}>{inner}</Link>;
}
