'use client';

import { Gift } from 'lucide-react';
import { Button } from '@/components/shared/buttons/Button';
import { TicketRewardIcon } from '@/components/shared/icons/TicketRewardIcon';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ClaimableTicket } from '@/types/interfaces/referral.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface FriendsClaimSummaryCardProps {
  /** LC waiting across every friend who still counts as a referral. */
  claimableLc: number;
  friendsWithRewards: number;
  /** LEGACY: leftover ticket commission, drains to zero and never refills. */
  ticketsByType: Record<TicketType, number>;
  loading?: boolean;
  onClaimAll: () => void;
}

export function FriendsClaimSummaryCard({
  claimableLc,
  friendsWithRewards,
  ticketsByType,
  loading,
  onClaimAll,
}: FriendsClaimSummaryCardProps) {
  const t = useAppTranslations();

  const stacks: ClaimableTicket[] = (Object.entries(ticketsByType) as [TicketType, number][])
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => ({ type, amount }));

  // `loading` keeps the card mounted with nothing left to claim, and that is the
  // point: it owns the only spinner «Забрать всё» has. The batch clears each
  // friend's row as its claim goes through, so an unguarded card could vanish
  // mid-collect and leave the press with no feedback at all.
  if (!loading && claimableLc === 0 && stacks.length === 0) return null;

  return (
    <div
      className="shine-card relative flex flex-col gap-3 overflow-hidden rounded-2xl p-4"
      style={{ ['--shine-card-accent' as string]: 'var(--color-gold)' }}
    >
      <div className="flex items-center gap-3">
        <div className="bg-gold/15 border-gold/30 flex-center h-10 w-10 flex-shrink-0 rounded-xl border">
          <Gift size={20} className="text-gold" strokeWidth={2.2} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-gold text-base font-extrabold leading-tight tabular-nums">
            {claimableLc.toLocaleString()} {GlobalConstants.coinName}
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
              <TicketRewardIcon tier={type} amount={amount} size={20} />
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
