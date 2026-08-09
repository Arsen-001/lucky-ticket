'use client';

import { Ticket as TicketIcon } from 'lucide-react';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { staggerMs } from '@/utils/global/animation.utils';

/**
 * Teaser row under the coupon: the reward kinds a code can drop, so the page
 * never feels like a bare input.
 *
 * Stars are deliberately not listed. A code can still grant them and the reveal
 * shows them when it happens — but this row is a promise made before anything
 * is entered, and naming Telegram's currency here reads as a price tag on a
 * screen where nothing is for sale.
 */
export function PromoRewardHintChips() {
  const t = useAppTranslations();

  const chips = [
    {
      key: 'lc',
      icon: <LcLabel size={13} interactive={false} />,
      label: GlobalConstants.coinName,
    },
    {
      key: 'tickets',
      icon: <TicketIcon size={13} className="text-electric-pink" />,
      label: t('tickets'),
    },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
        {t('promo possible rewards')}
      </span>
      <div className="flex items-center gap-1.5">
        {chips.map((chip, index) => (
          <span
            key={chip.key}
            className="animate-slide-in-bottom inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/6 px-2.5 py-1.5 text-[11px] font-bold text-white/85"
            style={{ animationDelay: `${staggerMs(index, 50)}ms` }}
          >
            {chip.icon}
            {chip.label}
          </span>
        ))}
      </div>
    </div>
  );
}
