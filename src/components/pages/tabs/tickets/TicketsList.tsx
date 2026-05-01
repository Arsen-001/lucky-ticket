'use client';

import { twMerge } from 'tailwind-merge';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TicketsSummaryCard } from '@/components/pages/tabs/tickets/TicketsSummaryCard';
import { OwnedTicketRow } from '@/components/pages/tabs/tickets/OwnedTicketRow';
import { LockedTicketCard } from '@/components/pages/tabs/tickets/LockedTicketCard';
import { TicketsHelperCard } from '@/components/pages/tabs/tickets/TicketsHelperCard';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { Ticket } from '@/types/types/ticket.types';

const OWNED_PLACEHOLDERS: Ticket[] = new Array(2).fill({ ticketType: 'bronze' });
const LOCKED_PLACEHOLDERS: Ticket[] = new Array(2).fill({ ticketType: 'platinum' });

export function TicketsList({ className }: ClassNameProps) {
  const t = useAppTranslations();
  const { data: tickets, isFetching } = useGetTicketsQuery();

  const owned = tickets?.filter(ticket => !ticket.blocked) ?? [];
  const locked = tickets?.filter(ticket => ticket.blocked) ?? [];

  const ownedItems = isFetching ? OWNED_PLACEHOLDERS : owned;
  const lockedItems = isFetching ? LOCKED_PLACEHOLDERS : locked;

  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
      <TicketsSummaryCard tickets={tickets} loading={isFetching} />

      <Section label={t('your tickets')}>
        <div className="flex flex-col gap-2.5">
          {ownedItems.map((ticket, index) => (
            <div
              key={ticket?.id ?? `owned-${index}`}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <OwnedTicketRow {...ticket} loading={isFetching} />
            </div>
          ))}
        </div>
      </Section>

      {(isFetching || locked.length > 0) && (
        <Section label={t('unlock more tiers')}>
          <div className="grid grid-cols-2 gap-2.5">
            {lockedItems.map((ticket, index) => (
              <div
                key={ticket?.id ?? `locked-${index}`}
                className="animate-slide-in-bottom"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <LockedTicketCard {...ticket} loading={isFetching} />
              </div>
            ))}
          </div>
        </Section>
      )}

      <TicketsHelperCard className="mt-1" />
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[11px] font-bold uppercase tracking-[1.2px] text-pink-secondary px-1">
        {label}
      </div>
      {children}
    </div>
  );
}
