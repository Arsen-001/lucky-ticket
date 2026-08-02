'use client';

import { twMerge } from 'tailwind-merge';
import { useCountDown } from '@/hooks/useCountDown';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { getCountdown } from '@/utils/global/date.utils';
import { CountdownUnit } from './CountdownUnit';

export interface LaunchCountdownProps {
  /** Absolute launch instant (ISO). @see comingSoonConfig.launchAt */
  targetDate: string;
  className?: string;
}

/**
 * Ticking days / hours / minutes / seconds until the app opens.
 *
 * `useCountDown` starts at all-zeros and fills in from an effect. Everywhere
 * else in the app that is invisible — a tile in a list is surrounded by content
 * that already says what it is. Here the countdown IS the page, and on prod
 * 2 of 5 cold loads still read "00 · 00 · 00 · 00" two and a half seconds in:
 * a launch date of nothing, which reads as broken. So the first paint computes
 * the value itself and the hook takes over from the first tick.
 *
 * The hook's unfilled state is distinguishable from a real one: a genuine
 * all-zero countdown has passed its target, and would come back `expired`.
 */
export function LaunchCountdown({ targetDate, className }: LaunchCountdownProps) {
  const t = useAppTranslations();
  const live = useCountDown(targetDate);
  const unfilled = !live.expired && !live.days && !live.hours && !live.minutes && !live.seconds;
  const { days, hours, minutes, seconds, expired } = unfilled ? getCountdown(targetDate) : live;

  // Past the target the numbers can only sit at zero, which reads as broken —
  // say it in words instead until the gate is actually lifted.
  if (expired) {
    return (
      <p
        className={twMerge(
          'text-electric-pink animate-fade-in text-sm font-extrabold uppercase tracking-wider',
          className
        )}
      >
        {t('launching any moment')}
      </p>
    );
  }

  const units = [
    { key: 'days', value: days, label: t('days') },
    { key: 'hours', value: hours, label: t('hours') },
    { key: 'minutes', value: minutes, label: t('minutes') },
    { key: 'seconds', value: seconds, label: t('seconds') },
  ];

  return (
    <div className={twMerge('flex w-full flex-col items-center gap-2', className)}>
      <span className="text-white-secondary text-[11px] font-bold uppercase tracking-[0.2em]">
        {t('launch in')}
      </span>
      <div className="flex w-full items-stretch gap-2">
        {units.map((unit, index) => (
          <CountdownUnit
            key={unit.key}
            value={unit.value}
            label={unit.label}
            className="animate-slide-in-bottom"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
