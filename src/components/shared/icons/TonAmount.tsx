import { twMerge } from 'tailwind-merge';
import { TonIcon } from './TonIcon';
import { formatTon } from '@/utils/global/partners.utils';

export interface TonAmountProps {
  /** Amount in TON (decimal). */
  value: number;
  size?: number;
  className?: string;
  classNames?: { icon?: string; value?: string };
}

/** A TON amount rendered as the Toncoin glyph + a trimmed number. */
export function TonAmount({ value, size = 13, className, classNames }: TonAmountProps) {
  return (
    <span className={twMerge('inline-flex items-center gap-1', className)}>
      <TonIcon size={size} className={twMerge('shrink-0', classNames?.icon)} />
      <span className={twMerge('tabular-nums', classNames?.value)}>{formatTon(value)}</span>
    </span>
  );
}
