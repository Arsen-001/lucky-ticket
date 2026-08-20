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
 * The exchange button, on the screen's top edge, wearing its own discount.
 *
 * A button rather than a label: this is the shortest way to the cheapest door
 * to Lucky Stars, and the discount is the reason to take it. The percent
 * disappears when the exchange is not actually cheaper — the corner never
 * advertises a saving that isn't there — and the button stays.
 */
export function StarsExchangeSavingBadge({ className }: StarsExchangeSavingBadgeProps) {
  const t = useAppTranslations();
  const { percent } = useStarsExchangeSaving();

  return (
    <Link
      href={EXCHANGE_ROUTE}
      aria-label={
        percent > 0 ? t('cheaper than telegram by {percent}', { percent }) : t('exchange')
      }
      className={twMerge(
        'border-gold/40 bg-gold/12 tap-target relative inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white transition-colors active:scale-95',
        className
      )}
      style={{ boxShadow: '0 0 14px rgba(248,189,62,0.25)' }}
    >
      <ArrowLeftRight size={12} className="text-gold" strokeWidth={3} />
      {t('exchange')}
      {percent > 0 && (
        <span className="bg-gold/25 text-gold rounded-full px-1.5 py-0.5 text-[10px] tabular-nums">
          −{percent}%
        </span>
      )}
    </Link>
  );
}
