'use client';

import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Ticket as TicketGlyph } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { TicketRewardInfoModal } from '@/components/shared/modals/TicketRewardInfoModal';
import { tierTicketNameId } from '@/constants/tier-names';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TicketType } from '@/types/types/ticket.types';

/** The ticket artwork is 1695×879 — the width one unit of height needs. */
const TICKET_ASPECT = 1.93;

export interface TicketRewardIconProps {
  /**
   * The tier the reward actually credits. `undefined` ⇒ nobody knows (a mixed
   * balance, a teaser for "some tickets") and the outline glyph stands in.
   */
  tier?: TicketType;
  /** How many — named in the modal, not drawn on the icon. */
  amount?: number;
  /** Height of the artwork, matching the Lucide `size` it replaces. */
  size?: number;
  /** Off inside anything that must stay one single tap target. */
  interactive?: boolean;
  className?: string;
}

/**
 * A ticket reward, drawn as the ticket it actually pays.
 *
 * The tier is the whole value of a ticket reward, and a monochrome outline
 * glyph hides it — every task row, ad slot and claim screen showed the same
 * icon whether the reward was a Bronze ticket or a Diamond one. Here the
 * artwork carries the tier, and a tap opens {@link TicketRewardInfoModal},
 * which names it in words for anyone who does not read the colours yet.
 */
export function TicketRewardIcon({
  tier,
  amount,
  size = 14,
  interactive = true,
  className,
}: TicketRewardIconProps) {
  const t = useAppTranslations();
  // `null` = never opened, so a screen full of reward badges mounts no modals
  // at all until one is actually tapped.
  const [open, setOpen] = useState<boolean | null>(null);

  if (!tier) {
    return (
      <TicketGlyph size={size} className={twMerge('text-electric-pink shrink-0', className)} />
    );
  }

  const art = (
    <Ticket
      type={tier}
      width={Math.round(size * TICKET_ASPECT)}
      height={size}
      className="shrink-0 drop-shadow-sm"
    />
  );

  if (!interactive) return <span className={twMerge('inline-flex', className)}>{art}</span>;

  const show = (event: MouseEvent | KeyboardEvent) => {
    // The badge nearly always sits inside a card that is itself a button.
    event.preventDefault();
    event.stopPropagation();
    setOpen(true);
  };

  const handleKey = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    show(event);
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        onKeyDown={handleKey}
        aria-label={t(tierTicketNameId[tier])}
        className={twMerge(
          'relative inline-flex shrink-0 items-center transition-transform active:scale-90',
          className
        )}
      >
        {art}
        {/* A 14px-tall ticket inside a chip is nowhere near a finger. The zone
            reaches past the artwork without moving anything around it. */}
        <span aria-hidden className="absolute -inset-2" />
      </button>
      {open !== null && (
        <TicketRewardInfoModal
          open={open}
          onClose={() => setOpen(false)}
          tier={tier}
          amount={amount}
        />
      )}
    </>
  );
}
