'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Star, Ticket, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { TaskReward } from '@/types/interfaces/tasks.interfaces';
import { formatNumber } from '@/utils/global/number.utils';

export interface ClaimRewardAmountProps {
  reward: TaskReward;
  className?: string;
}

/** Counts up to `target` once, then holds it. */
const useCounter = (target: number, durationMs = 900) => {
  const [value, setValue] = useState(0);
  const startedAt = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    setValue(0);
    startedAt.current = null;
    const tick = (ts: number) => {
      if (startedAt.current === null) startedAt.current = ts;
      const elapsed = ts - startedAt.current;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setValue(Math.round(target * eased));
      if (ratio < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs]);

  return value;
};

/**
 * The headline figure of a reward modal: the amount, counted up, next to the
 * mark of the currency it is paid in.
 *
 * The mark is the point. A bare "+150" says nothing — the same modal pays LC,
 * activity points, tickets and stars, and the player had to guess which one
 * from the colour of the prize circle behind it.
 */
export function ClaimRewardAmount({ reward, className }: ClaimRewardAmountProps) {
  const value = useCounter(reward.amount);

  const unit: Record<TaskRewardType, React.ReactNode> = {
    [TaskRewardType.LC]: <CoinIcon size={28} />,
    [TaskRewardType.ACTIVITY_POINTS]: <BoltIcon size={34} />,
    [TaskRewardType.TICKETS]: <Ticket size={28} className="text-electric-pink" />,
    [TaskRewardType.STARS]: <Star size={26} className="fill-warning text-warning" />,
    [TaskRewardType.PREMIUM]: <Sparkles size={26} className="text-pink" />,
    [TaskRewardType.ENGINE]: <Trophy size={26} className="text-platinum" />,
  };

  return (
    <div className={twMerge('flex items-center justify-center gap-2', className)}>
      <span className="from-gold via-electric-pink to-electric-purple bg-gradient-to-r bg-clip-text text-4xl leading-none font-extrabold tabular-nums text-transparent">
        +{formatNumber(value)}
      </span>
      <span className="flex-center shrink-0">{unit[reward.type]}</span>
    </div>
  );
}
