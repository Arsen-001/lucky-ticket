'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatNumber } from '@/utils/global/number.utils';
import '@/styles/components/jackpot.css';

interface JackpotPotCounterProps {
  /** Server pot value (base). The displayed value never goes below this. */
  value: number;
  /** Approx LC/sec the pot grows — sizes the periodic "+X" bumps. */
  accrualPerSecond: number;
  /** Applied to the number text (e.g. size + `jackpot-glow`). */
  className?: string;
}

/**
 * Live odometer for the hero pot. The number creeps upward on its own (periodic
 * bumps simulate tournaments feeding the pot in the mock), each bump flashing a
 * rising "+X". It tweens smoothly between values via rAF and never ticks
 * backwards when the server value reconciles on refetch.
 */
export function JackpotPotCounter({ value, accrualPerSecond, className }: JackpotPotCounterProps) {
  const [display, setDisplay] = useState(value);
  const [pop, setPop] = useState<{ amount: number; key: number } | null>(null);
  const targetRef = useRef(value);

  // Reconcile with the server value without ever going backwards.
  useEffect(() => {
    if (value > targetRef.current) targetRef.current = value;
    setDisplay(prev => (value > prev ? value : prev));
  }, [value]);

  // Periodic bumps = tournaments dripping their 10% into the pot.
  useEffect(() => {
    const id = window.setInterval(() => {
      const bump = Math.round(accrualPerSecond * (2 + Math.random() * 4));
      targetRef.current += bump;
      setPop({ amount: bump, key: Date.now() });
    }, 2800);
    return () => window.clearInterval(id);
  }, [accrualPerSecond]);

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
