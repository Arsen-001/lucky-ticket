'use client';

import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { tierTicketNameId } from '@/constants/tier-names';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import type { DailyGiftState } from '@/types/interfaces/status-gift.interfaces';

export interface LuckyPlayerDailyGiftRewardProps {
  gift: DailyGiftState;
  className?: string;
}

/** Both tiles share one skeleton — icon, value, caption — so a one-part gift
 *  and a two-part one line their numbers up on the same baseline. */
const TILE =
  'flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3';
const VALUE = 'text-[19px] leading-none font-extrabold text-white tabular-nums';
const CAPTION = 'text-white-secondary text-[10.5px] leading-none font-semibold';

/**
 * What today's gift pays, as one tile per currency.
 *
 * Rendered from the same `gift` object in both modal modes, so the promo can
 * never advertise a drop other than the one the subscriber collects — and a
 * zero part is dropped rather than shown as "+0", because an admin retuning the
 * gift to LC only should not leave an empty ticket slot on the card.
 */
export function LuckyPlayerDailyGiftReward({ gift, className }: LuckyPlayerDailyGiftRewardProps) {
  const t = useAppTranslations();

  if (gift.lc <= 0 && gift.ticketCount <= 0) return null;

  return (
    <div className={twMerge('flex w-full items-stretch gap-2', className)}>
      {gift.lc > 0 && (
        <div className={TILE}>
          <span className="flex-center h-9">
            <LcLabel size={30} interactive={false} />
          </span>
          <span className={VALUE}>+{formatNumber(gift.lc)}</span>
          <span className={CAPTION}>{GlobalConstants.coinName}</span>
        </div>
      )}

      {gift.ticketCount > 0 && (
        <div className={TILE}>
          <span className="flex-center h-9">
            <Ticket type={gift.ticketTier} width={56} />
          </span>
          <span className={VALUE}>+{formatNumber(gift.ticketCount)}</span>
          <span className={CAPTION}>{t(tierTicketNameId[gift.ticketTier])}</span>
        </div>
      )}
    </div>
  );
}
