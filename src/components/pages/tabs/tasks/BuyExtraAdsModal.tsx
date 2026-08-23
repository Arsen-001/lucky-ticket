'use client';

import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Clock } from 'lucide-react';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { QuantityStepper } from '@/components/shared/form-elements/QuantityStepper';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetMeQuery } from '@/api/me.api';
import { useQuoteExtraAdViewsQuery } from '@/api/tasks.api';
import type { AdsExtraOffer } from '@/types/interfaces/tasks.interfaces';
import { AdRewardRow } from './AdRewardRow';

type Currency = 'lc' | 'ls';

/**
 * Stepper ceiling when the server reports no daily ceiling at all. It mirrors
 * the server's own per-request guard — the point is that one purchase stays a
 * bounded number, not that the day is capped.
 */
const MAX_PER_PURCHASE = 100;

export interface BuyExtraAdsModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (count: number, currency: Currency) => void;
  loading?: boolean;
  extra: AdsExtraOffer;
}

/**
 * Buy extra ad views for the rest of the day.
 *
 * Three things are stated before the player pays, because all three are
 * surprises otherwise: what the purchase actually pays out, that the slots die
 * at the daily reset, and that the two currencies are not priced at parity
 * (Stars can't go below 1, so LC is the cheaper path).
 *
 * The payout is quoted BY THE SERVER for this exact count. The paid ladder
 * climbs, so a total worked out here as "one view × count" would promise
 * rewards the grant path never pays — the same reason the slot list is server
 * built.
 */
export function BuyExtraAdsModal({
  open,
  onClose,
  onConfirm,
  loading,
  extra,
}: BuyExtraAdsModalProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const [count, setCount] = useState(1);
  const [currency, setCurrency] = useState<Currency>('lc');

  useEffect(() => {
    if (open) setCount(1);
  }, [open]);

  // No ceiling on the server means the stepper needs one anyway — a single
  // purchase is capped server-side, and an unbounded stepper offers a number
  // the request would refuse.
  const max = extra.remaining === null ? MAX_PER_PURCHASE : Math.max(1, extra.remaining);
  const unit = currency === 'ls' ? extra.priceLs : extra.priceLc;
  const total = unit * count;
  const balance = currency === 'ls' ? (me?.telegramStars ?? 0) : (me?.coins ?? 0);
  const short = balance < total;

  // Skipped while the modal is closed: it is one request per count the player
  // stops on, and a closed modal stops on nothing.
  const { data: quote, isFetching: quoting } = useQuoteExtraAdViewsQuery(count, {
    skip: !open,
  });
  // The count the quote answers for — a stale one from the previous step must
  // not be read as this step's payout while the new one is in flight.
  const quoteRewards = quote?.count === count ? quote.rewards : undefined;
  // Fallback while the first quote lands (and on a backend that has no quote
  // route at all): what ONE bought view pays, labelled as such rather than
  // multiplied.
  const perView = extra.nextRewards?.[0];

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={() => onConfirm(count, currency)}
      loading={loading}
      confirmText={short ? t('not enough balance') : t('buy')}
      hideConfirm={short}
      title={t('buy more ads')}
      content={
        <div className="mt-2 flex flex-col gap-4 text-white/80">
          <p className="text-center text-[13px] leading-snug text-white/60">
            {t('extra ads explainer')}
          </p>

          {/* Currency picker — both prices visible at once, so the cheaper path
              is a choice rather than a discovery. */}
          <div className="flex gap-2">
            {(['lc', 'ls'] as const).map(c => {
              const active = currency === c;
              const price = c === 'ls' ? extra.priceLs : extra.priceLc;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  aria-pressed={active}
                  className={twMerge(
                    'flex flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition-colors',
                    active
                      ? 'border-electric-pink/60 bg-white/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-base font-bold tabular-nums text-white">
                      {formatNumber(price)}
                    </span>
                    {c === 'lc' ? (
                      <LcLabel size={14} interactive={false} />
                    ) : (
                      <TelegramStarIcon size={15} />
                    )}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-white/45">
                    {t('per view')}
                  </span>
                </button>
              );
            })}
          </div>

          <QuantityStepper value={count} onChange={setCount} max={max} />

          {/* What the money buys. Above the price on purpose: the reward is the
              reason to read the price, not the other way round. */}
          {Boolean(quoteRewards?.length || perView?.length) && (
            <div className="border-electric-pink/25 from-electric-pink/[0.12] flex flex-col gap-2 rounded-xl border bg-gradient-to-b to-transparent px-3.5 py-3">
              <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase">
                {quoteRewards ? t('you get for watching') : t('per view')}
              </span>
              <AdRewardRow
                rewards={quoteRewards ?? perView ?? []}
                muted={quoting && !quoteRewards}
              />
              {/* The purchase is a slot, not a payout — the reward lands when
                  the view is watched, and saying so here is cheaper than a
                  support message tomorrow. */}
              <span className="text-[11px] leading-snug text-white/45">
                {t('extra ads reward on watch')}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
            <span className="text-pink-secondary text-sm font-bold uppercase tracking-wider">
              {count > 1 ? t('total') : t('price')}
            </span>
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tabular-nums text-white">
                  {formatNumber(total)}
                </span>
                {currency === 'lc' ? (
                  <LcLabel size={16} interactive={false} />
                ) : (
                  <TelegramStarIcon size={18} />
                )}
              </div>
              <span
                className={twMerge(
                  'text-[11px] tabular-nums',
                  short ? 'text-error-text' : 'text-white/50'
                )}
              >
                {t('available')} {formatCompact(balance)}
              </span>
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[11px] leading-snug text-white/45">
            <Clock size={12} className="shrink-0" />
            {t('extra ads expire at reset')}
          </p>
        </div>
      }
    />
  );
}
