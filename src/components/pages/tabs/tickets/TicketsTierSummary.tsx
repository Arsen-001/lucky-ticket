'use client';

import { twMerge } from 'tailwind-merge';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { Ticket, TicketType } from '@/types/types/ticket.types';

const TIER_ORDER: TicketType[] = [
  TicketsEnum.BRONZE,
  TicketsEnum.SILVER,
  TicketsEnum.GOLD,
  TicketsEnum.PLATINUM,
  TicketsEnum.DIAMOND,
];

export interface TicketsTierSummaryProps extends ClassNameProps {
  tickets?: Ticket[];
  loading?: boolean;
  activeTier?: TicketType;
  onTierClick?: (tier: TicketType) => void;
}

export function TicketsTierSummary({
  tickets,
  loading,
  activeTier,
  onTierClick,
  className,
}: TicketsTierSummaryProps) {
  return (
    <div className={twMerge('grid grid-cols-5 gap-2', className)}>
      {TIER_ORDER.map(tier => {
        const ticket = tickets?.find(item => item.ticketType === tier);
        const count = ticket?.count ?? 0;
        const isActive = activeTier === tier;
        const tierColor = `var(--color-${tier})`;
        return (
          <button
            type="button"
            key={tier}
            onClick={() => onTierClick?.(tier)}
            className={twMerge(
              'relative flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 cursor-pointer transition-colors active:scale-[0.96] overflow-hidden',
              !isActive && 'bg-white/3 hover:bg-white/6'
            )}
            style={
              isActive
                ? {
                    background: `linear-gradient(180deg, color-mix(in srgb, ${tierColor} 30%, transparent) 0%, color-mix(in srgb, ${tierColor} 8%, transparent) 100%)`,
                  }
                : undefined
            }
          >
            {isActive && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                style={{
                  background:
                    'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)',
                }}
              />
            )}
            <div className="flex-center relative">
              <TicketOverlap type={tier} width={28} height={22} />
            </div>
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton className="h-3 w-6" variant="line" />}
            >
              <span className="relative text-[13px] font-extrabold text-white tabular-nums leading-none">
                {count}
              </span>
            </SkeletonSuspense>
          </button>
        );
      })}
    </div>
  );
}
