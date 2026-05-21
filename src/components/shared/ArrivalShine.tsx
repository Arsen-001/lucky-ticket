'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

export interface ArrivalShineProps {
  /** Matches the `?highlight=` query param set by the linking source. */
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a section that can be deep-linked to. When the page is opened with
 * `?highlight=<id>` the wrapper scrolls into view and shines briefly, so the
 * user sees where the action they came for lives.
 */
export function ArrivalShine({ id, children, className }: ArrivalShineProps) {
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);
  const [shining, setShining] = useState(false);

  const isTarget = searchParams.get('highlight') === id;

  useEffect(() => {
    if (!isTarget) return;
    setShining(true);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const timer = setTimeout(() => setShining(false), 2800);
    return () => clearTimeout(timer);
  }, [isTarget]);

  return (
    <div
      ref={ref}
      className={twMerge('rounded-2xl', shining && 'animate-arrival-shine', className)}
    >
      {children}
    </div>
  );
}
