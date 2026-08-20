'use client';

import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStarsExchangeSaving } from '@/hooks/useStarsExchangeSaving';
import { routes } from '@/constants/routes';
import type { Route } from '@/constants/routes';

export interface StarsExchangeSavingBadgeProps {
  className?: string;
}

/** Opens the Stars screen with its exchange sheet already up. */
const EXCHANGE_ROUTE = `${routes.stars}?action=exchange` as Route;

/**
 * «−11 %» in the corner of the Stars screen: the exchange sells a Lucky Star
 * cheaper than Telegram sells the star that buys one, and that is the first
 * thing worth knowing on a screen about buying them.
 *
 * A link, not a label — the tap lands where the discount is spent, with the
 * exchange sheet already open. Renders nothing when the exchange is not
 * actually cheaper, so the corner never advertises a saving that isn't there.
 */
export function StarsExchangeSavingBadge({ className }: StarsExchangeSavingBadgeProps) {
  const t = useAppTranslations();
  const { percent } = useStarsExchangeSaving();

  if (percent <= 0) return null;

  return (
    <Link
      href={EXCHANGE_ROUTE}
      aria-label={t('cheaper than telegram by {percent}', { percent })}
      className={twMerge(
        'border-gold/40 bg-gold/12 text-gold tap-target relative inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-extrabold tabular-nums transition-colors active:scale-95',
        className
      )}
      style={{ boxShadow: '0 0 14px rgba(248,189,62,0.25)' }}
    >
      <ArrowLeftRight size={11} strokeWidth={3} />−{percent}%
    </Link>
  );
}
