'use client';

import { Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useStarPackages } from '@/hooks/useStarPackages';

export interface StarsPromoNoteProps {
  className?: string;
}

/**
 * How long the package bonus keeps paying, wherever packages are offered.
 *
 * One component for all three surfaces (the Stars screen, the buy sheet, the
 * Market's Limited tab) because the deadline is one date: three hand-rolled
 * countdowns would eventually disagree by a minute, and a promo whose clock
 * disagrees with itself reads as a trick. Draws nothing when there is no
 * deadline, and nothing once it has passed — at that point the bonus is gone
 * from the cards too, so a stopped clock would be the only thing still
 * mentioning it.
 */
export function StarsPromoNote({ className }: StarsPromoNoteProps) {
  const t = useAppTranslations();
  const { promoEndsAt, promoActive } = useStarPackages();
  const { days, hours, minutes, seconds, expired } = useCountDown(promoEndsAt);

  if (!promoEndsAt || !promoActive || expired) return null;

  // A bare duration, not `leftTimeShort`: that one already reads «2 days left»,
  // and inside «Offer ends in …» it doubles the word («ends in 2 days left»).
  // Two units are enough at any distance — seconds under an hour, where they
  // are the part that moves.
  const left =
    days > 0
      ? `${days}${t('day short')} ${hours}${t('hour short')}`
      : hours > 0
        ? `${hours}${t('hour short')} ${minutes}${t('minute short')}`
        : `${minutes}${t('minute short')} ${seconds}${t('second short')}`;

  return (
    <span
      className={twMerge(
        'border-gold/35 bg-gold/10 text-gold inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold tabular-nums',
        className
      )}
    >
      <Timer size={10} strokeWidth={3} />
      {t('offer ends in {time}', { time: left })}
    </span>
  );
}
