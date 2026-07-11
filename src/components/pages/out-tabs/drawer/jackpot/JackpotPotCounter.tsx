'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { JackpotOdometer } from '@/components/pages/tabs/home/JackpotOdometer';
import { formatNumber } from '@/utils/global/number.utils';
import '@/styles/components/jackpot.css';

interface JackpotPotCounterProps {
  /** Server pot value (base). The displayed value never goes below this. */
  value: number;
  /** Applied to the number text (e.g. size + `jackpot-glow-gold`). */
  className?: string;
}

/**
 * Live slot-reel number for the hero pot. The pot only grows when a tournament
 * finishes (its 10% skim), so there is NO fake creep: on a real increase the
 * odometer reels roll to the server value in discrete steps (each step visibly
 * spins the reels — same cadence as the Home capsule), flashing the actual
 * "+X" gain, and never tick backwards when the value reconciles on refetch.
 */
export function JackpotPotCounter({ value, className }: JackpotPotCounterProps) {
  const [display, setDisplay] = useState(value);
  const [pop, setPop] = useState<{ amount: number; key: number } | null>(null);
  const targetRef = useRef(value);

  // Reconcile with the server value: an actual increase rolls the reels up
  // and pops the real gain; first load snaps into place.
  useEffect(() => {
    if (value <= targetRef.current) return;
    const wasLoaded = targetRef.current > 0;
    const gain = value - targetRef.current;
    targetRef.current = value;
    if (wasLoaded) setPop({ amount: gain, key: Date.now() });
    else setDisplay(value);
  }, [value]);

  // Discrete steps toward the target — each one visibly rolls the reels.
  useEffect(() => {
    const id = window.setInterval(() => {
      setDisplay(prev => {
        const diff = targetRef.current - prev;
        if (diff <= 0) return prev;
        return diff <= 2 ? targetRef.current : prev + Math.max(1, Math.round(diff * 0.35));
      });
    }, 450);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="relative inline-flex flex-col items-center">
      <JackpotOdometer value={display} className={twMerge('tabular-nums', className)} />
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
