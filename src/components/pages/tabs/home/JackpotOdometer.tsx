'use client';

import { twMerge } from 'tailwind-merge';
import { formatNumber } from '@/utils/global/number.utils';
import '@/styles/components/jackpot-odometer.css';

export interface JackpotOdometerProps {
  value: number;
  className?: string;
}

const REEL_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Casino-counter rendering of a number: every digit sits in its own dark cell
 * and ROLLS vertically to its next value (a strip of 0-9 translated by CSS),
 * separators stay static between cells. Digits are keyed by their position
 * from the RIGHT so a digit-count change (9,999,99x → 10,000,00x) keeps the
 * low-order reels rolling instead of remounting them.
 */
export function JackpotOdometer({ value, className }: JackpotOdometerProps) {
  const chars = formatNumber(Math.max(0, Math.floor(value))).split('');

  return (
    <span className={twMerge('inline-flex items-baseline gap-[0.06em] tabular-nums', className)}>
      {chars.map((char, index) => {
        const positionFromRight = chars.length - index;
        if (!/\d/.test(char)) {
          return (
            <span key={`sep-${positionFromRight}`} className="opacity-70">
              {char}
            </span>
          );
        }
        return (
          <span key={`digit-${positionFromRight}`} className="jackpot-odometer-cell">
            <span className="jackpot-odometer-reel" style={{ top: `-${Number(char) * 1.2}em` }}>
              {REEL_DIGITS.map(digit => (
                <span key={digit}>{digit}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
