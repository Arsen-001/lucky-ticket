'use client';

import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { Ticket, TicketType } from '@/types/types/ticket.types';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export interface TicketsSummaryCardProps extends ClassNameProps {
  tickets?: Ticket[];
  loading?: boolean;
}

const PREVIEW_TICKET_TYPES: TicketType[] = ['bronze', 'silver', 'gold'];

const getPendingCount = (ticket: Ticket) =>
  ticket.engines?.reduce((sum, engine) => sum + (engine.pendingCount || 0), 0) ?? 0;

export function TicketsSummaryCard({ tickets, loading, className }: TicketsSummaryCardProps) {
  const t = useAppTranslations();

  const owned = tickets?.filter(ticket => !ticket.blocked) ?? [];

  const totalInventory = owned.reduce((sum, ticket) => sum + (ticket.count || 0), 0);
  const totalReady = owned.reduce((sum, ticket) => sum + getPendingCount(ticket), 0);
  const activeEngines = owned.reduce((sum, ticket) => sum + (ticket.engines?.length || 0), 0);
  const tierCount = tickets?.length ?? 0;
  const unlockedCount = owned.length;

  const previewTickets = PREVIEW_TICKET_TYPES.map(type =>
    owned.find(ticket => ticket.ticketType === type && !!ticket.count)
  ).filter((ticket): ticket is Ticket => Boolean(ticket));

  return (
    <div
      className={twMerge(
        'card-outlined bg-purple-gradient rounded-xl p-4.5 relative overflow-hidden',
        className
      )}
    >
      <div
        aria-hidden
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-electric-pink), transparent 70%)',
        }}
      />

      <div className="flex justify-between items-start gap-3 relative">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[1.2px] text-pink-secondary">
            {t('total tickets')}
          </div>
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton className="mt-1 h-9 w-32" variant="rounded-rectangle" />}
          >
            <div className="flex items-baseline gap-1.5 mt-1">
              <GoldenText className="text-[34px] leading-none font-extrabold tracking-tight">
                {totalInventory}
              </GoldenText>
              <span className="text-xs font-semibold text-white-secondary">
                {t('in inventory')}
              </span>
            </div>
          </SkeletonSuspense>
        </div>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton className="h-9 w-24" variant="rounded-rectangle" />}
        >
          <div className="flex gap-1.5 shrink-0">
            {previewTickets.map(ticket => (
              <TicketOverlap key={ticket.id} type={ticket.ticketType} width={36} height={28} />
            ))}
          </div>
        </SkeletonSuspense>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-3.5 pt-3 border-t border-white/6 relative">
        <SummaryStat
          label={t('engines')}
          value={activeEngines}
          sub={t('active')}
          loading={loading}
        />
        <SummaryStat
          label={t('ready')}
          value={totalReady}
          sub={t('to claim')}
          highlight={totalReady > 0}
          loading={loading}
        />
        <SummaryStat
          label={t('tiers')}
          value={`${unlockedCount}/${tierCount}`}
          sub={t('unlocked')}
          loading={loading}
        />
      </div>
    </div>
  );
}

interface SummaryStatProps {
  label: string;
  value: number | string;
  sub: string;
  highlight?: boolean;
  loading?: boolean;
}

function SummaryStat({ label, value, sub, highlight = false, loading }: SummaryStatProps) {
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
              'text-lg font-extrabold tabular-nums',
              highlight ? 'text-success' : 'text-white'
            )}
            style={{
              textShadow: highlight ? '0 0 12px rgba(74,222,128,0.45)' : undefined,
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
