'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { Ticket } from '@/components/shared/icons/Ticket';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { Ticket as TicketModel, TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';

const titleIdByType: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

const descriptionIdByType: Record<TicketType, MessageIds> = {
  bronze: 'bronze ticket description',
  silver: 'silver ticket description',
  gold: 'golden ticket description',
  platinum: 'platinum ticket description',
  diamond: 'diamond ticket description',
};

export interface TicketDetailsHeroProps {
  ticket?: TicketModel;
  loading?: boolean;
  totalReady?: number;
  className?: string;
}

export function TicketDetailsHero({
  ticket,
  loading,
  totalReady = 0,
  className,
}: TicketDetailsHeroProps) {
  const t = useAppTranslations();

  const ticketType = ticket?.ticketType ?? 'bronze';
  const inventory = ticket?.count ?? 0;
  const engineCount = ticket?.engines?.length ?? 0;
  const unlocked = !ticket?.blocked;
  const tierColor = `var(--color-${ticketType})`;
  const showOverlap = !loading && inventory >= 2;

  return (
    <div
      className={twMerge(
        'card-outlined rounded-2xl p-4.5 pb-4 relative overflow-hidden',
        className
      )}
      style={{
        background: `radial-gradient(circle at 100% 0%, color-mix(in srgb, ${tierColor} 30%, transparent) 0%, transparent 50%), var(--gradient-purple-reverse)`,
      }}
    >
      <div className="flex items-start gap-4 relative">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton className="h-25 w-25 rounded-2xl" />}
        >
          <div
            className="w-25 h-25 rounded-2xl flex-center shrink-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${tierColor} 50%, transparent) 0%, transparent 70%)`,
            }}
          >
            {showOverlap ? (
              <TicketOverlap type={ticketType} width={94} height={70} />
            ) : (
              <Ticket type={ticketType} width={86} height={86} />
            )}
          </div>
        </SkeletonSuspense>

        <div className="flex-1 min-w-0">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton className="h-4 w-20" variant="line" />}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="text-[11px] font-bold uppercase tracking-[0.5px] px-2.5 py-1 rounded-full"
                style={{
                  color: tierColor,
                  background: `color-mix(in srgb, ${tierColor} 12%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${tierColor} 25%, transparent)`,
                }}
              >
                {t(titleIdByType[ticketType])}
              </span>
              {!unlocked && (
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-pink-secondary bg-pink-secondary/18 border border-pink-secondary/40">
                  {t('locked')}
                </span>
              )}
            </div>
          </SkeletonSuspense>

          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton className="mt-2 h-6 w-36" variant="line" />}
          >
            <h2 className="mt-1.5 text-2xl font-extrabold text-white tracking-tight leading-tight">
              {t('{tier} ticket', { tier: t(titleIdByType[ticketType]) })}
            </h2>
          </SkeletonSuspense>

          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton className="mt-2 h-3 w-full" variant="line" />}
          >
            <div className="mt-2 text-[11px] text-white-secondary leading-snug">
              {t(descriptionIdByType[ticketType])}
            </div>
          </SkeletonSuspense>
        </div>
      </div>

      {unlocked && (
        <div className="mt-4 pt-3.5 border-t border-white/6 grid grid-cols-3 gap-2.5 relative">
          <HeroStat label={t('owned')} value={inventory} sub={t('tickets')} big loading={loading} />
          <HeroStat label={t('engines')} value={engineCount} sub={t('active')} loading={loading} />
          <HeroStat
            label={t('ready')}
            value={totalReady}
            sub={t('to claim')}
            highlight={totalReady > 0}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

interface HeroStatProps {
  label: string;
  value: number | string;
  sub: string;
  highlight?: boolean;
  big?: boolean;
  loading?: boolean;
}

function HeroStat({ label, value, sub, highlight = false, big = false, loading }: HeroStatProps) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-[0.8px] text-pink-secondary">
        {label}
      </div>
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton className="mt-1 h-5 w-12" variant="rounded-rectangle" />}
      >
        <div className="flex items-baseline gap-1 mt-0.5">
          <span
            className={twMerge(
              'font-extrabold tabular-nums leading-none',
              big ? 'text-[22px]' : 'text-lg',
              highlight ? 'text-success' : 'text-white'
            )}
            style={{
              textShadow: highlight ? '0 0 12px rgba(74,222,128,0.5)' : undefined,
            }}
          >
            {value}
          </span>
          <span className="text-[10px] text-pink-secondary">{sub}</span>
        </div>
      </SkeletonSuspense>
    </div>
  );
}
