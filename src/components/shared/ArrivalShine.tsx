'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

export type ArrivalShineVariant = 'block' | 'title';

export interface ArrivalShineProps {
  /** Matches the `?highlight=` query param set by the linking source. */
  id: string | string[];
  /** `block` glows the container box; `title` glows the heading text inside. */
  variant?: ArrivalShineVariant;
  /** Scroll the target into view on arrival. Disable for full-page wrappers. */
  scroll?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a section that can be deep-linked to. When the page is opened with
 * `?highlight=<id>` the wrapper shines briefly — and scrolls into view if it
 * isn't already visible — so the user sees where the action they came for
 * lives. `variant="title"` glows the heading text instead of the box.
 */
export function ArrivalShine({
  id,
  variant = 'block',
  scroll = true,
  children,
  className,
}: ArrivalShineProps) {
  const searchParams = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);
  const [shining, setShining] = useState(false);

  const highlight = searchParams.get('highlight');
  const isTarget =
    highlight !== null && (Array.isArray(id) ? id.includes(highlight) : id === highlight);

  useEffect(() => {
    if (!isTarget) return;
    setShining(true);
    if (scroll) {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const visible = rect.top >= 0 && rect.bottom <= window.innerHeight;
        if (!visible) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    const timer = setTimeout(() => setShining(false), 2800);
    return () => clearTimeout(timer);
  }, [isTarget, scroll]);

  return (
    <div
      ref={ref}
      className={twMerge(
        'rounded-2xl',
        shining && (variant === 'title' ? 'animate-arrival-title-shine' : 'animate-arrival-shine'),
        className
      )}
    >
      {children}
    </div>
  );
}
