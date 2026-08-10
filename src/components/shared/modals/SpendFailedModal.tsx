'use client';

import { PackageX } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface SpendFailedModalProps {
  open: boolean;
  onClose: () => void;
  /** Already translated — see `spendFailure`. */
  reason?: string;
}

/**
 * A paid action the server refused for a reason with nowhere to go — sold out,
 * no longer on sale, the market closed mid-tap, VIP already at its ceiling.
 *
 * It exists because these used to be a toast carrying the backend's own English
 * sentence ("Out of stock"), which is a wire format and not copy: a
 * Russian-speaking player got a line of English that vanished in three seconds,
 * on a screen that had just taken their tap and looked like it did nothing. The
 * reassurance matters as much as the reason — a failed purchase reads as lost
 * coins until something says otherwise.
 */
export function SpendFailedModal({ open, onClose, reason }: SpendFailedModalProps) {
  const t = useAppTranslations();
  const title = t('purchase not completed');

  return (
    <Modal open={open} onClose={onClose} label={title}>
      <div className="bg-purple-gradient relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl p-6 text-center">
        <span
          aria-hidden
          className="bg-error/20 pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
        />

        <div className="flex-center ring-electric-purple/20 relative h-14 w-14 rounded-2xl bg-white/5 ring-1">
          <PackageX size={26} className="text-pink-secondary" strokeWidth={2.2} />
        </div>

        <h2 className="relative text-lg font-extrabold leading-tight text-white">{title}</h2>
        <p className="text-pink-secondary relative max-w-[280px] text-[12px] leading-snug">
          {reason}
        </p>

        <Button
          variant="primary"
          onClick={onClose}
          className="relative mt-1 w-full rounded-xl py-3 text-sm font-bold"
        >
          {t('got it')}
        </Button>
      </div>
    </Modal>
  );
}
