'use client';

import { twMerge } from 'tailwind-merge';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';

export interface StarPackageCardProps {
  /** Telegram Stars charged. */
  stars: number;
  /** Lucky Stars handed over on top of the payment — 0 once the promo ended. */
  bonus: number;
  /** The recommended package — highlighted, one per sheet. */
  popular?: boolean;
  /** The one most people take — a second, independent label. */
  top?: boolean;
  active?: boolean;
  onSelect: () => void;
  className?: string;
}

/**
 * One Telegram-Stars top-up package: what it charges and what it credits.
 *
 * Both numbers, always — a package that showed only the price would leave the
 * bonus to be discovered after paying, and one that showed only the total would
 * hide what Telegram is about to charge. The bonus pill names the difference so
 * the two numbers can't read as a mistake.
 */
export function StarPackageCard({
  stars,
  bonus,
  popular,
  top,
  active,
  onSelect,
  className,
}: StarPackageCardProps) {
  const t = useAppTranslations();
  // Both labels ride in one strip on the top edge, so a package carrying both
  // does not stack them over each other — and the percent below knows to step
  // down for either.
  const labelled = popular || top;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={twMerge(
        'relative flex flex-col items-start gap-1 rounded-2xl border px-3 py-2.5 text-start transition-colors active:scale-99',
        active
          ? 'border-gold/60 bg-gold/20'
          : 'border-white/10 bg-white/5 hover:bg-white/10 focus-visible:bg-white/10',
        className
      )}
    >
      {labelled && (
        <span className="absolute -top-2 end-2 flex items-center gap-1">
          {top && (
            // Solid electric purple, not `bg-gradient-purple`: that gradient is
            // the app's dark card ground (rgb(51,34,71)) and a pill painted with
            // it disappears into the tile it sits on — the label read as loose
            // text with no chip at all.
            <span className="bg-electric-purple rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white">
              {t('top')}
            </span>
          )}
          {popular && (
            <span className="bg-pink-gradient rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white">
              {t('best value')}
            </span>
          )}
        </span>
      )}

      {bonus > 0 && (
        // The bonus as a percent, set at the price's own size in the opposite
        // corner — the shape a discount takes in any shop. It used to be a 9px
        // pill trailing «you get 250», which reads as a footnote to that number
        // instead of as the reason to pick this tile. Sits a row lower when the
        // «best value» ribbon is out, so the two never overlap.
        <span
          className={twMerge(
            'text-gold absolute end-3 text-[15px] font-extrabold leading-none tabular-nums',
            labelled ? 'top-5' : 'top-2.5'
          )}
          style={{ textShadow: '0 0 12px rgba(248,189,62,0.45)' }}
        >
          +{Math.round((bonus / stars) * 100)}%
        </span>
      )}

      <span className="flex items-center gap-1 text-[15px] font-extrabold tabular-nums text-white">
        <TelegramStarIcon size={13} />
        {formatNumber(stars)}
      </span>

      <span className="text-gold text-[13px] font-extrabold tabular-nums">
        {t('you receive {stars}', { stars: formatNumber(stars + bonus) })}
      </span>
    </button>
  );
}
