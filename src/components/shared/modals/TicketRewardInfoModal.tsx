'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { Ticket } from '@/components/shared/icons/Ticket';
import { routes } from '@/constants/routes';
import { tierTicketDescriptionId, tierTicketNameId } from '@/constants/tier-names';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import type { TicketType } from '@/types/types/ticket.types';

export interface TicketRewardInfoModalProps {
  open: boolean;
  onClose: () => void;
  /** The tier that will actually be credited — never a guess. */
  tier: TicketType;
  /** How many are coming. Omitted where the badge names a type, not a payout. */
  amount?: number;
}

/**
 * "Which tickets is this, exactly?"
 *
 * A reward that pays tickets used to render as a generic outline glyph and a
 * number, so the one thing that decides what the reward is worth — its tier —
 * was invisible: a Diamond ticket and a Bronze one looked identical in every
 * task row, ad slot and claim screen. The badges now carry the tier's own
 * artwork, and tapping one opens this: the ticket at full size, its name, how
 * many are coming, what it unlocks, and the way to the screen holding them.
 */
export function TicketRewardInfoModal({ open, onClose, tier, amount }: TicketRewardInfoModalProps) {
  const t = useAppTranslations();
  const router = useRouter();

  const title = t(tierTicketNameId[tier]);
  const many = (amount ?? 0) > 1;

  // Closing first keeps the modal from animating out over the next screen.
  const handleNavigate = () => {
    onClose();
    router.push(routes.tickets.index);
  };

  return (
    <Modal open={open} onClose={onClose} label={title}>
      <div className="bg-purple-gradient relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl p-6 text-center">
        <span
          aria-hidden
          className="bg-electric-pink/12 pointer-events-none absolute -top-14 -right-10 h-44 w-44 rounded-full blur-2xl"
        />

        {/* The stacked artwork for a pile, the single ticket for one — the same
            language the Tickets screen uses for a tier's balance. */}
        <div className="relative flex-center h-24">
          {many ? (
            <TicketOverlap type={tier} width={148} height={102} />
          ) : (
            <Ticket type={tier} width={158} height={82} />
          )}
        </div>

        <div className="relative flex flex-col items-center gap-1">
          <h2 className="text-lg leading-tight font-extrabold text-white">{title}</h2>
          {!!amount && (
            <span className="text-electric-pink bg-electric-pink/12 rounded-full px-2.5 py-1 text-[12px] leading-none font-extrabold tabular-nums">
              +{formatNumber(amount)}
            </span>
          )}
        </div>

        <p className="text-pink-secondary relative max-w-[280px] text-[12px] leading-snug">
          {t(tierTicketDescriptionId[tier])}
        </p>

        <div className="relative mt-1 flex w-full flex-col gap-2">
          <Button
            variant="primary"
            onClick={handleNavigate}
            icon={<ArrowRight />}
            iconPosition="right"
            iconSize={16}
            className="w-full rounded-xl py-3 text-sm font-bold"
          >
            {t('view tickets')}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-pink-secondary text-[11px] font-bold tracking-wider uppercase"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
