'use client';

import { useEffect, useRef, useState } from 'react';
import { formatNumber } from '@/utils/global/number.utils';

interface LeaderboardCountUpProps {
  value: number;
  durationMs?: number;
  enabled?: boolean;
  className?: string;
}

export function LeaderboardCountUp({
  value,
  durationMs = 900,
  enabled = true,
  className,
}: LeaderboardCountUpProps) {
  const [display, setDisplay] = useState(enabled ? 0 : value);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }
    if (startedRef.current) {
      setDisplay(value);
      return;
    }
    startedRef.current = true;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setDisplay(Math.round(value * eased));
      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs, enabled]);

  return <span className={className}>{formatNumber(display)}</span>;
}
