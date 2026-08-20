'use client';

import { twMerge } from 'tailwind-merge';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';

export interface StarPackageCardProps {
  /** Telegram Stars charged. */
  stars: number;
  /** Lucky Stars handed over on top of the payment. */
  bonus: number;
  /** The recommended package — highlighted, one per sheet. */
  popular?: boolean;
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
  active,
  onSelect,
  className,
}: StarPackageCardProps) {
  const t = useAppTranslations();

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
      {popular && (
        <span className="bg-pink-gradient absolute -top-2 end-2 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white">
          {t('best value')}
        </span>
      )}

      <span className="flex items-center gap-1 text-[15px] font-extrabold tabular-nums text-white">
        <TelegramStarIcon size={13} />
        {formatNumber(stars)}
      </span>

      <span className="flex flex-wrap items-center gap-1.5">
        <span className="text-gold text-[13px] font-extrabold tabular-nums">
          {t('you receive {stars}', { stars: formatNumber(stars + bonus) })}
        </span>
        {bonus > 0 && (
          <span className="bg-gold/20 text-gold rounded-full px-1 py-0.5 text-[9px] font-extrabold tabular-nums">
            +{formatNumber(bonus)}
          </span>
        )}
      </span>
    </button>
  );
}
