'use client';

import { Gift } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ClaimableTicket } from '@/types/interfaces/referral.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface FriendsClaimSummaryCardProps {
  claimableTotal: number;
  friendsWithRewards: number;
  ticketsByType: Record<TicketType, number>;
  loading?: boolean;
  onClaimAll: () => void;
}

export function FriendsClaimSummaryCard({
  claimableTotal,
  friendsWithRewards,
  ticketsByType,
  loading,
  onClaimAll,
}: FriendsClaimSummaryCardProps) {
  const t = useAppTranslations();

  if (claimableTotal === 0) return null;

  const stacks: ClaimableTicket[] = (Object.entries(ticketsByType) as [TicketType, number][])
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => ({ type, amount }));

  return (
    <div className="card-outlined bg-purple-gradient flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="bg-gold/15 border-gold/30 flex-center h-10 w-10 flex-shrink-0 rounded-xl border">
          <Gift size={20} className="text-gold" strokeWidth={2.2} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-gold text-base font-extrabold leading-tight">
            {t('claimable tickets count', { count: claimableTotal })}
          </span>
          <span className="text-pink-secondary text-xs">
            {t('claim from {count} friends', { count: friendsWithRewards })}
          </span>
        </div>
      </div>

      {stacks.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-black/25 px-3 py-2.5">
          {stacks.map(({ type, amount }) => (
            <div key={type} className="flex items-center gap-1.5">
              <Ticket type={type} width={22} height={22} className="drop-shadow-sm" />
              <span className="text-sm font-extrabold tabular-nums text-white">×{amount}</span>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="primary"
        loading={loading}
        onClick={onClaimAll}
        className="h-11 w-full rounded-xl py-0 text-sm font-extrabold"
      >
        {t('claim all')}
      </Button>
    </div>
  );
}
