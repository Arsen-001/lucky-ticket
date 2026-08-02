import { useEffect, useState } from 'react';
import {
  type CountdownState,
  durationToMS,
  getCountdown,
  getLeftTimestamp,
  getTimeText,
  pad,
} from '@/utils/global/date.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { Duration } from '@/types/interfaces/date.interfaces';

export interface UseCountdownResult extends CountdownState {
  leftTime: string;
  /** Adaptive short label: "5 days", "5h 30m", "12m 30s", or "30s". */
  leftTimeShort: string;
  leftTimeText: string;
  getPassedPercentage: (fullTime?: Duration) => number;
}

const INITIAL_COUNTDOWN_STATE: CountdownState = {
  expired: false,
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

const isSameCountdown = (a: CountdownState, b: CountdownState): boolean =>
  a.expired === b.expired &&
  a.days === b.days &&
  a.hours === b.hours &&
  a.minutes === b.minutes &&
  a.seconds === b.seconds;

export const useCountDown = (targetDate?: string | Date | number): UseCountdownResult => {
  const [state, setState] = useState<CountdownState>(INITIAL_COUNTDOWN_STATE);
  const t = useAppTranslations();

  // Key the effect on the instant, not the value handed in: callers pass
  // `new Date(...)`, a fresh object on every render, which tore the interval
  // down and rebuilt it each time — and each rebuild set state, which caused
  // the next render.
  const targetMs = targetDate == null ? null : new Date(targetDate).getTime();
  const hasTarget = targetMs !== null && !Number.isNaN(targetMs);

  useEffect(() => {
    // Every tick used to store a freshly allocated state object, so a row
    // re-rendered once a second whether or not anything had changed — and rows
    // with nothing to count (a finished tournament, a task with no reset time)
    // paid it too. A list of them re-rendered end to end, every second.
    const apply = (next: CountdownState) =>
      setState(prev => (isSameCountdown(prev, next) ? prev : next));

    if (!hasTarget) {
      // No target = nothing to count; `getCountdown` reads that as expired.
      apply(getCountdown(undefined));
      return;
    }

    const first = getCountdown(targetMs);
    apply(first);
    // Already over: the numbers can no longer change, so don't run a timer.
    if (first.expired) return;

    const timer = setInterval(() => {
      const next = getCountdown(targetMs);
      apply(next);
      if (next.expired) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetMs, hasTarget]);

  // Dedicated short-unit keys — deriving them from the first letter of the
  // full word is ambiguous in de (Stunde/Sekunde both start with "S").
  const timeUnits = {
    days: t('day short'),
    hours: t('hour short'),
    minutes: t('minute short'),
    seconds: t('second short'),
  };

  const hhmmss = `${pad(state.hours)}:${pad(state.minutes)}:${pad(state.seconds)}`;
  const leftTime = state.days > 0 ? `${state.days}${timeUnits.days} ${hhmmss}` : hhmmss;
  const leftTimeText = getTimeText(state, timeUnits);

  let leftTimeShort: string;
  if (state.days >= 2) {
    leftTimeShort = t('{n} days left', { n: state.days });
  } else if (state.days === 1) {
    leftTimeShort = t('1 day left');
  } else if (state.hours > 0) {
    leftTimeShort = `${state.hours}${timeUnits.hours} ${state.minutes}${timeUnits.minutes}`;
  } else if (state.minutes > 0) {
    leftTimeShort = `${state.minutes}${timeUnits.minutes} ${state.seconds}${timeUnits.seconds}`;
  } else {
    leftTimeShort = `${state.seconds}${timeUnits.seconds}`;
  }
  const getPassedPercentage = (fullDuration?: Duration) => {
    if (!fullDuration) return 0;
    const leftTimestamp = getLeftTimestamp(targetDate);
    const fullDurationTimestamp = durationToMS(fullDuration);
    const leftPercentage = Math.floor((leftTimestamp / fullDurationTimestamp) * 100);
    return 100 - leftPercentage;
  };

  return { ...state, leftTime, leftTimeShort, leftTimeText, getPassedPercentage };
};
