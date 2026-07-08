'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatNumber } from '@/utils/global/number.utils';
import '@/styles/components/jackpot.css';

interface JackpotPotCounterProps {
  /** Server pot value (base). The displayed value never goes below this. */
  value: number;
  /** Applied to the number text (e.g. size + `jackpot-glow`). */
  className?: string;
}

/**
 * Live number for the hero pot. The pot only grows when a tournament finishes
 * (its 10% skim), so there is NO fake creep: the number tweens (via rAF) to
 * the real server value when it increases, flashing the actual "+X" gain, and
 * never ticks backwards when the value reconciles on refetch.
 */
export function JackpotPotCounter({ value, className }: JackpotPotCounterProps) {
  const [display, setDisplay] = useState(value);
  const [pop, setPop] = useState<{ amount: number; key: number } | null>(null);
  const targetRef = useRef(value);

  // Reconcile with the server value: an actual increase tweens the number up
  // and pops the real gain; first load snaps into place.
  useEffect(() => {
    if (value <= targetRef.current) return;
    const wasLoaded = targetRef.current > 0;
    const gain = value - targetRef.current;
    targetRef.current = value;
    if (wasLoaded) setPop({ amount: gain, key: Date.now() });
    else setDisplay(value);
  }, [value]);

  // Smoothly chase the target each frame; settle exactly when close.
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setDisplay(prev => {
        const diff = targetRef.current - prev;
        if (Math.abs(diff) < 1) return targetRef.current;
        return prev + Math.max(1, diff * 0.08);
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <span className="relative inline-flex flex-col items-center">
      <span className={twMerge('tabular-nums', className)}>
        {formatNumber(Math.floor(display))}
      </span>
      {pop && (
        <span
          key={pop.key}
          aria-hidden
          className="jackpot-pop text-electric-pink absolute -top-2 left-1/2 text-sm font-extrabold tabular-nums"
        >
          +{formatNumber(pop.amount)}
        </span>
      )}
    </span>
  );
}
