'use client';

import { twMerge } from 'tailwind-merge';
import { BalanceSparkline } from './BalanceSparkline';

export interface BalanceChartBandProps {
  values: number[];
  /** What the band covers, already translated — «Last 7 days». */
  caption: string;
  className?: string;
}

/**
 * The balance curve given a strip of its own at the bottom of the card.
 *
 * The shipped version lets the curve run under the whole card, which puts data
 * behind the rate and the delta chip — legible today only because the mock
 * balance happens to trend upward. A band is a promise that text and curve
 * never share pixels, and it puts the period label next to the thing it labels
 * instead of in the opposite corner. Laid out in flow, so a card can stack it
 * under its content without hand-tuned padding.
 */
export function BalanceChartBand({ values, caption, className }: BalanceChartBandProps) {
  if (values.length < 2) return null;

  return (
    <div className={twMerge('relative h-16 w-full border-t border-white/8', className)}>
      <BalanceSparkline values={values} className="absolute inset-0" />
      {/* Chip, not bare text: the curve is free to pass through any corner of
          its own band, and it struck the label through on the first render. */}
      <span className="absolute start-4 top-1.5 rounded bg-black/35 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/55">
        {caption}
      </span>
    </div>
  );
}
