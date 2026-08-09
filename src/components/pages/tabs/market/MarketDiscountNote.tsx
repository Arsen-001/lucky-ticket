'use client';

import Link from 'next/link';
import { ChevronRight, Percent } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMeQuery } from '@/api/me.api';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { effectiveMarketDiscountPct } from '@/utils/global/market.utils';

export interface MarketDiscountNoteProps {
  className?: string;
}

/**
 * States the player's own Market discount — the one the status perk already
 * took off every price on the screen.
 *
 * Without it the discount was legible only as a strike-through on each price
 * button, which says *that* a price dropped but never *why* or *by how much*:
 * at VIP 2 the whole story was "13.74M → 13.47M". The percentage comes from
 * `effectiveMarketDiscountPct` — the same value the prices were recomputed
 * with — so the line can never disagree with the price tags beside it.
 *
 * The no-status case is not hidden: the same slot names what a status would
 * give instead, so the row keeps one height for every player and the Market
 * header doesn't jump between accounts.
 */
export function MarketDiscountNote({ className }: MarketDiscountNoteProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();

  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const pct = effectiveMarketDiscountPct(isLp, isVip, me?.statusPerks);
  const hasDiscount = pct > 0;

  return (
    <Link
      href={routes.market('status')}
      className={twMerge(
        'bg-background-overlay flex items-center gap-2 rounded-xl border border-white/8 px-3 py-2 transition-transform active:scale-99',
        className
      )}
    >
      <Percent
        size={13}
        strokeWidth={3}
        className={twMerge('shrink-0', hasDiscount ? 'text-electric-pink' : 'text-pink-secondary')}
      />
      {hasDiscount ? (
        <span className="flex min-w-0 items-baseline gap-1.5 text-[12px] leading-tight font-bold text-white">
          <span className="text-electric-pink tabular-nums">−{pct}%</span>
          <span className="text-pink-secondary truncate font-semibold">
            {isVip ? `${t('vip')} ${me?.vipLevel ?? ''}`.trim() : t('lucky player')} ·{' '}
            {t('discount already in prices')}
          </span>
        </span>
      ) : (
        <span className="text-pink-secondary min-w-0 truncate text-[12px] leading-tight font-semibold">
          {t('get market discount {pct}', { pct: GlobalConstants.luckyPlayerMarketDiscountPct })}
        </span>
      )}
      <ChevronRight size={15} className="text-pink-secondary ml-auto shrink-0" />
    </Link>
  );
}
