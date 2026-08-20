'use client';

import { ArrowLeftRight, Plus, Store } from 'lucide-react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStarsExchangeSaving } from '@/hooks/useStarsExchangeSaving';
import { routes } from '@/constants/routes';
import { BalanceActionCell } from '@/components/shared/cards/BalanceActionCell';

export interface StarsActionRowProps {
  onBuy: () => void;
  onExchange: () => void;
  /**
   * No TON wallet bound yet — the exchange sheet says so on the inside, the
   * padlock says it before the tap.
   */
  exchangeLocked?: boolean;
  className?: string;
}

const CELL =
  'flex min-h-13 flex-1 items-center justify-center gap-1.5 px-1 text-[11px] font-extrabold uppercase tracking-wide transition-colors hover:bg-white/4 cursor-pointer';

/**
 * The three answers to "and now what?" as the balance card's own footer — the
 * same strip the LC screen ends with, because these act on the number above
 * them: get more (Telegram Stars), get more (TON), spend them.
 */
export function StarsActionRow({
  onBuy,
  onExchange,
  exchangeLocked,
  className,
}: StarsActionRowProps) {
  const t = useAppTranslations();
  // How much cheaper this door is than buying Stars in Telegram, on the button
  // that opens it — derived from the two published rates, so it cannot outlive
  // a price change.
  const { percent } = useStarsExchangeSaving();

  return (
    <div
      className={twMerge(
        'relative flex divide-x divide-white/8 border-t border-white/8',
        className
      )}
    >
      <button type="button" onClick={onBuy} className={CELL}>
        <BalanceActionCell Icon={Plus} label={t('buy')} />
      </button>

      <button type="button" onClick={onExchange} className={twMerge(CELL, 'relative')}>
        {/* A tab hanging off the cell's top edge instead of a pill beside the
            word: the three labels stay on one line (so the strip reads as one
            strip), and the cell keeps its width — «Exchange» and «Market» are
            the first things to hit the edges in German and Armenian. Centred
            with physical left/translate on purpose: centring is symmetric, so
            it lands right in RTL too. */}
        {percent > 0 && !exchangeLocked && (
          <span
            className="text-background absolute left-1/2 top-0 -translate-x-1/2 rounded-b-md px-1.5 py-px text-[8px] font-extrabold tabular-nums"
            style={{ background: 'linear-gradient(120deg,#ffe08a,#f8bd3e 55%,#b47b0a)' }}
          >
            −{percent}%
          </span>
        )}
        <BalanceActionCell Icon={ArrowLeftRight} label={t('exchange')} locked={exchangeLocked} />
      </button>

      {/* Where the balance is spent. No tab: Lucky Stars buy across the whole
          storefront — statuses, engines, tickets, shards — so pinning one
          category here would narrow the answer without reason. */}
      <Link href={routes.market()} className={CELL}>
        <BalanceActionCell Icon={Store} label={t('market')} />
      </Link>
    </div>
  );
}
