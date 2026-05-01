'use client';

import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { Ticket, TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';

export type OwnedTicketRowProps = Ticket & ClassNameProps & { loading?: boolean };

const titleIdByType: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

export function OwnedTicketRow({
  id,
  ticketType,
  count,
  engines,
  loading,
  className,
}: OwnedTicketRowProps) {
  const t = useAppTranslations();

  const engineCount = engines?.length ?? 0;
  const enginesReady =
    engines?.reduce((sum, engine) => sum + (engine.pendingCount > 0 ? 1 : 0), 0) ?? 0;
  const pendingTotal = engines?.reduce((sum, engine) => sum + (engine.pendingCount || 0), 0) ?? 0;

  const inner = (
    <div
      className={twMerge(
        'card-outlined bg-purple-gradient rounded-xl p-3.5 relative flex items-center gap-3.5',
        'transition-transform duration-100 active:scale-[0.99]',
        className
      )}
    >
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton className="h-17.5 w-19 rounded-2xl" />}
      >
        <div
          className="h-17.5 w-19 rounded-2xl flex-center shrink-0"
          style={{
            background: `radial-gradient(circle at 50% 60%, var(--color-${ticketType === 'gold' ? 'gold' : ticketType})/40 0%, transparent 70%)`,
          }}
        >
          <TicketOverlap type={ticketType} width={62} height={56} />
        </div>
      </SkeletonSuspense>

      <div className="flex-1 min-w-0">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton className="h-4 w-28" variant="line" />}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-white">
              {t(titleIdByType[ticketType])}
            </span>
          </div>
        </SkeletonSuspense>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton className="mt-1.5 h-5 w-24" variant="line" />}
        >
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[22px] font-extrabold text-white leading-none tabular-nums">
              {count ?? 0}
            </span>
            <span className="text-[11px] font-semibold text-pink-secondary">
              {t('in inventory')}
            </span>
          </div>
        </SkeletonSuspense>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton className="mt-1.5 h-3 w-32" variant="line" />}
        >
          <div className="mt-1.5 text-[11px] text-white-secondary">
            <span className="text-pink-secondary">{engineCount}</span>{' '}
            <span className="text-pink-secondary">
              {engineCount === 1 ? t('engine') : t('engines')}
            </span>
            {enginesReady > 0 && (
              <>
                <span className="text-pink-secondary"> · </span>
                <span className="text-success font-bold">
                  {t('{count} ready', { count: enginesReady })}
                </span>
              </>
            )}
          </div>
        </SkeletonSuspense>
      </div>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton className="h-6 w-18" variant="rounded-rectangle" />}
      >
        <div className="flex flex-col items-end justify-center shrink-0">
          {pendingTotal > 0 ? (
            <div className="bg-pink-gradient flex-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(222,0,155,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
              {t('claim')} {pendingTotal}
            </div>
          ) : (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-pink-secondary">
              {t('producing')}
            </span>
          )}
        </div>
      </SkeletonSuspense>
    </div>
  );

  if (loading) {
    return inner;
  }

  return <Link href={routes.tickets.getById(id)}>{inner}</Link>;
}
